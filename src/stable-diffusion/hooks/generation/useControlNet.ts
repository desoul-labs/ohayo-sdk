import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import _ from 'lodash';
import { useContext } from 'react';
import { ENDPOINT_URL } from 'src/stable-diffusion/config/endpoint';
import {
  booleanOption,
  sharedSchema,
} from 'src/stable-diffusion/constants/schema';
import { StableDiffusionContext } from 'src/stable-diffusion/context/StableDiffusionContext';
import { PredictionResult } from 'src/stable-diffusion/types/shared';
import { z } from 'zod';

const schema = sharedSchema.extend({
  controlnetModel: z.string(),
  controlnetType: z.enum([
    'canny',
    'depth',
    'hed',
    'mlsd',
    'normal',
    'openpose',
    'scribble',
    'segmentation',
  ]),
  autoHint: booleanOption,
  guessMode: booleanOption,
  initImage: z.string().url(),
  maskImage: z.string().url(),
  strength: z.number().gte(0).lte(1).default(0.7).optional(),
  embeddingsModel: z.string().nullish().default(null).optional(),
});
export type UseControlNetArgs = z.infer<typeof schema>;

export type UseControlNetConfig = UseQueryOptions<
  PredictionResult,
  Error,
  PredictionResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseControlNetArgs & {
  apiKey: string;
};

const queryKey = (args: QueryArgs) =>
  ['stable-diffusion', 'controlnet', args] as const;

const queryFn: QueryFunction<
  PredictionResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { apiKey, ...opts }] }) => {
  const validated = schema.parse(opts);
  const response = await fetch(`${ENDPOINT_URL}/v5/controlnet`, {
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
      return res as PredictionResult;
    case 'error':
      throw new Error(res.message);
  }

  throw new Error('Unknown response');
};

export const useControlNet = ({
  modelId,
  controlnetModel,
  controlnetType,
  autoHint,
  guessMode,
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
  initImage,
  maskImage,
  strength,
  ...config
}: UseControlNetArgs & UseControlNetConfig) => {
  const { apiKey } = useContext(StableDiffusionContext);

  const qryKey = queryKey({
    apiKey,
    modelId,
    controlnetModel,
    controlnetType,
    autoHint,
    guessMode,
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
    loraModel,
    loraStrength,
    initImage,
    maskImage,
    strength,
  });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
