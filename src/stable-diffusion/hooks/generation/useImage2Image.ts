import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import _ from 'lodash';
import { useContext } from 'react';
import { ENDPOINT_URL } from 'src/stable-diffusion/config/endpoint';
import { sharedSchema } from 'src/stable-diffusion/constants/schema';
import { StableDiffusionContext } from 'src/stable-diffusion/context/StableDiffusionContext';
import { PredictionResult } from 'src/stable-diffusion/types/shared';
import { z } from 'zod';

const schema = sharedSchema.extend({
  initImage: z.string().url(),
  strength: z.number().gte(0).lte(1).default(0.7).optional(),
});
export type UseImage2ImageArgs = z.infer<typeof schema>;

export type UseImage2ImageConfig = UseQueryOptions<
  PredictionResult,
  Error,
  PredictionResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseImage2ImageArgs & {
  apiKey: string;
};

const queryKey = (args: QueryArgs) =>
  ['stable-diffusion', 'image2image', args] as const;

const queryFn: QueryFunction<
  PredictionResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { apiKey, ...opts }] }) => {
  const validated = schema.parse(opts);
  const response = await fetch(`${ENDPOINT_URL}/v4/dreambooth/img2img`, {
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

export const useImage2Image = ({
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
  initImage,
  strength,
  ...config
}: UseImage2ImageArgs & UseImage2ImageConfig) => {
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
    guidanceScale,
    tomesd,
    useKarrasSigmas,
    vae,
    loraModel,
    loraStrength,
    initImage,
    strength,
  });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
