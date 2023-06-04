import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import _ from 'lodash';
import { useContext } from 'react';
import { ENDPOINT_URL } from 'src/stable-diffusion/config/endpoint';
import { StableDiffusionContext } from 'src/stable-diffusion/context/StableDiffusionContext';
import { PredictionResult } from 'src/stable-diffusion/types/shared';
import { z } from 'zod';

const schema = z.object({
  url: z.string().url(),
  scale: z.number().positive(),
  faceEnhance: z.boolean().default(false).optional(),
});
export type UseSuperResolutionArgs = z.infer<typeof schema>;

export type UseSuperResolutionConfig = UseQueryOptions<
  PredictionResult,
  Error,
  PredictionResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseSuperResolutionArgs & {
  apiKey: string;
};

const queryKey = (args: QueryArgs) =>
  ['stable-diffusion', 'super-resolution', args] as const;

const queryFn: QueryFunction<
  PredictionResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { apiKey, ...opts }] }) => {
  const validated = schema.parse(opts);
  const response = await fetch(`${ENDPOINT_URL}/v3/super_resolution`, {
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

export const useSuperResolution = ({
  url,
  scale,
  faceEnhance,
  ...config
}: UseSuperResolutionArgs & UseSuperResolutionConfig) => {
  const { apiKey } = useContext(StableDiffusionContext);

  const qryKey = queryKey({
    apiKey,
    url,
    scale,
    faceEnhance,
  });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
