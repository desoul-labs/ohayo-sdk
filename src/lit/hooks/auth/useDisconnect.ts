import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { useLitContext } from '../useLitContext';

export type UseDisconnectConfig = UseMutationOptions<void, Error, {}>;

const mutationKey = () => ['lit', 'disconnect'] as const;

const mutationFn: MutationFunction<void, {}> = async () => {};

export const useDisconnect = (config: UseDisconnectConfig = {}) => {
  const { setSessionSigs, setSessionKey } = useLitContext();

  const mutKey = mutationKey();
  const { mutate, mutateAsync, ...mutation } = useMutation(mutKey, mutationFn, {
    ...config,
    onSuccess: (data, variables, options) => {
      setSessionSigs(undefined);
      setSessionKey(undefined);
      config.onSuccess?.(data, variables, options);
    },
  });

  const disconnect = () => mutate({});

  const disconnectAsync = async () => await mutateAsync({});

  return {
    disconnect,
    disconnectAsync,
    ...mutation,
  };
};
