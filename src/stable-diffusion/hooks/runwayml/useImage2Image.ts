import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import _ from 'lodash';
import { useContext } from 'react';
import { ENDPOINT_URL } from 'src/stable-diffusion/config/endpoint';
import { StableDiffusionContext } from 'src/stable-diffusion/context/StableDiffusionContext';
import { GenerationParameter } from 'src/stable-diffusion/types/shared';
import { z } from 'zod';

const schema = z.object({
  initImage: z.string().url(),
  prompt: z.string(),
  negativePrompt: z.string().nullable().default(null).optional(),
  width: z
    .number()
    .int()
    .gte(8)
    .lte(1024)
    .multipleOf(8)
    .default(512)
    .optional(),
  height: z
    .number()
    .int()
    .gte(8)
    .lte(1024)
    .multipleOf(8)
    .default(512)
    .optional(),
  samples: z.number().int().gte(1).lte(4).default(1).optional(),
  numInferenceSteps: z.enum(['20', '30', '40', '50']).default('20').optional(),
  safetyChecker: z
    .boolean()
    .default(false)
    .transform(val => (val ? 'yes' : 'no'))
    .optional(),
  enhancePrompt: z
    .boolean()
    .default(false)
    .transform(val => (val ? 'yes' : 'no'))
    .optional(),
  seed: z.number().int().nullish().default(null).optional(),
  guidanceScale: z.number().gte(1).lte(20).default(7.5).optional(),
  strength: z.number().gte(0).lte(1).default(0.7).optional(),
});
export type UseImage2ImageArgs = z.infer<typeof schema>;

export type Image2ImageResult = {
  status: 'success' | 'processing' | 'error';
  generationTime?: number;
  eta?: number;
  id: string;
  output: string[];
  meta: GenerationParameter;
  fetchResult?: () => Promise<Image2ImageResult>;
};

export type UseImage2ImageConfig = UseQueryOptions<
  Image2ImageResult,
  Error,
  Image2ImageResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseImage2ImageArgs & {
  apiKey: string;
};

const queryKey = (args: QueryArgs) =>
  ['stable-diffusion', 'image2image', args] as const;

const queryFn: QueryFunction<
  Image2ImageResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { apiKey, ...opts }] }) => {
  const validated = schema.parse(opts);
  const response = await fetch(`${ENDPOINT_URL}/img2img`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key: apiKey, ...validated }, key =>
      _.snakeCase(key),
    ),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const res = JSON.parse(await response.text(), key => _.camelCase(key));
  const fetchResult = async () => {
    const resp_ = await fetch(`${ENDPOINT_URL}/fetch/${res.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: apiKey }),
    });
    const res_ = JSON.parse(await resp_.text(), key => _.camelCase(key));
    res_.meta = res.meta;
    return res_ as Image2ImageResult;
  };

  switch (res.status) {
    case 'error':
      throw new Error(res.message);
    case 'success':
      return res as Image2ImageResult;
    case 'processing':
      res.fetchResult = fetchResult;
      return res as Image2ImageResult;
  }

  throw new Error('Unknown response');
};

export const useImage2Image = ({
  prompt,
  initImage,
  negativePrompt,
  width,
  height,
  samples,
  numInferenceSteps,
  safetyChecker,
  enhancePrompt,
  seed,
  guidanceScale,
  strength,
  ...config
}: UseImage2ImageArgs & UseImage2ImageConfig) => {
  const { apiKey } = useContext(StableDiffusionContext);

  const qryKey = queryKey({
    apiKey,
    initImage,
    prompt,
    negativePrompt,
    width,
    height,
    samples,
    numInferenceSteps,
    safetyChecker,
    enhancePrompt,
    seed,
    guidanceScale,
    strength,
  });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
