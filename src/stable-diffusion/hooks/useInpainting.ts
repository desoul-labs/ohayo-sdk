import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import _ from 'lodash';
import { useContext } from 'react';
import { z } from 'zod';
import { ENDPOINT_URL } from '../config/endpoint';
import { StableDiffusionContext } from '../context/StableDiffusionContext';
import { GenerationParameter } from '../types/shared';

const schema = z.object({
  initImage: z.string().url(),
  maskImage: z.string().url(),
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
export type UseInpaintingArgs = z.infer<typeof schema>;

export type InpaintingResult = {
  status: 'success' | 'processing' | 'error';
  generationTime?: number;
  eta?: number;
  id: string;
  output: string[];
  meta: GenerationParameter;
  fetchResult?: () => Promise<InpaintingResult>;
};

export type UseInpaintingConfig = UseQueryOptions<
  InpaintingResult,
  Error,
  InpaintingResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseInpaintingArgs & {
  apiKey: string;
};

const queryKey = (args: QueryArgs) =>
  ['stable-diffusion', 'inpainting', args] as const;

const queryFn: QueryFunction<
  InpaintingResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { apiKey, ...opts }] }) => {
  const validated = schema.parse(opts);
  const response = await fetch(`${ENDPOINT_URL}/inpaint`, {
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
    return res_ as InpaintingResult;
  };

  switch (res.status) {
    case 'error':
      throw new Error(res.message);
    case 'success':
      return res as InpaintingResult;
    case 'processing':
      res.fetchResult = fetchResult;
      return res as InpaintingResult;
  }

  throw new Error('Unknown response');
};

export const useInpainting = ({
  prompt,
  initImage,
  maskImage,
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
}: UseInpaintingArgs & UseInpaintingConfig) => {
  const { apiKey } = useContext(StableDiffusionContext);

  const qryKey = queryKey({
    apiKey,
    initImage,
    maskImage,
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
