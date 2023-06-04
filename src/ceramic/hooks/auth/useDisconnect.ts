import { CeramicClient } from '@ceramicnetwork/http-client';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { useCeramicContext } from '../useCeramicContext';

export type UseDisconnectConfig = UseMutationOptions<void, Error, {}>;

type MutationArgs = {
  client: CeramicClient;
};

const mutationKey = (args: MutationArgs) =>
  ['ceramic', 'disconnect', args] as const;

const mutationFn: MutationFunction<void, MutationArgs> = async ({ client }) =>
  await client.close();

export const useDisconnect = (config: UseDisconnectConfig = {}) => {
  const { client, setSession } = useCeramicContext();

  const mutKey = mutationKey({ client });
  const { mutate, mutateAsync, ...mutation } = useMutation(mutKey, mutationFn, {
    ...config,
    onSuccess: (data, variables, options) => {
      setSession(undefined);
      config.onSuccess?.(data, variables, options);
    },
  });

  const disconnect = () => mutate({ client });

  const disconnectAsync = async () => await mutateAsync({ client });

  return {
    disconnect,
    disconnectAsync,
    ...mutation,
  };
};
