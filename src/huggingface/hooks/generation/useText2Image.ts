import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import _ from 'lodash';
import { useContext } from 'react';
import { z } from 'zod';
import { ENDPOINT_URL } from '../../config/endpoint';
import { booleanOption, sharedSchema } from '../../constants/schema';
import { StableDiffusionContext } from '../../context/StableDiffusionContext';

const schema = sharedSchema.extend({
  multiLingual: booleanOption,
  panorama: booleanOption,
  selfAttention: booleanOption,
  upscale: booleanOption,
  embeddingsModel: z.string().nullish().default(null).optional(),
});
export type UseText2ImageArgs = z.infer<typeof schema>;

export type Text2ImageResult = {
  status: 'success' | 'processing' | 'error';
  generationTime?: number;
  eta?: number;
  id: string;
  output: string[];
  fetchResult?: () => Promise<Text2ImageResult>;
};

export type UseText2ImageConfig = UseQueryOptions<
  Text2ImageResult,
  Error,
  Text2ImageResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseText2ImageArgs & {
  apiKey: string;
};

const queryKey = (args: QueryArgs) =>
  ['stable-diffusion', 'text2image', args] as const;

const queryFn: QueryFunction<
  Text2ImageResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { apiKey, ...opts }] }) => {
  const validated = schema.parse(opts);
  const response = await fetch(`${ENDPOINT_URL}/v4/dreambooth`, {
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
  switch (res.status) {
    case 'success':
    case 'processing':
      return res as Text2ImageResult;
    case 'error':
      throw new Error(res.message);
  }

  throw new Error('Unknown response');
};

export const useText2Image = ({
  modelId,
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
  tomesd,
  useKarrasSigmas,
  vae,
  loraStrength,
  loraModel,
  scheduler,
  multiLingual,
  panorama,
  selfAttention,
  upscale,
  embeddingsModel,
  ...config
}: UseText2ImageArgs & UseText2ImageConfig) => {
  const { apiKey } = useContext(StableDiffusionContext);

  const qryKey = queryKey({
    apiKey,
    modelId,
    prompt,
    negativePrompt,
    width,
    height,
    samples,
    numInferenceSteps,
    safetyChecker,
    enhancePrompt,
    seed,
    loraModel,
    loraStrength,
    vae,
    tomesd,
    useKarrasSigmas,
    guidanceScale,
    multiLingual,
    panorama,
    selfAttention,
    upscale,
    embeddingsModel,
    scheduler,
  });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
