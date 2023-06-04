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
  strength: z.number().gte(0).lte(1).default(0.7).optional(),
});
export type UseText2VideoArgs = z.infer<typeof schema>;

export type UseText2VideoConfig = UseQueryOptions<
  PredictionResult,
  Error,
  PredictionResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseText2VideoArgs & {
  apiKey: string;
};

const queryKey = (args: QueryArgs) =>
  ['stable-diffusion', 'text2video', args] as const;

const queryFn: QueryFunction<
  PredictionResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { apiKey, ...opts }] }) => {
  const validated = schema.parse(opts);
  const response = await fetch(`${ENDPOINT_URL}/v4/dreambooth/text2video`, {
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

export const useText2Video = ({
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
  strength,
  ...config
}: UseText2VideoArgs & UseText2VideoConfig) => {
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
    strength,
  });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
