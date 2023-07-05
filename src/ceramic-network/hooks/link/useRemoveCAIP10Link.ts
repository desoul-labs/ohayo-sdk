import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking';
import { UpdateOpts } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { Signer } from 'ethers';
import { useCeramicContext } from '../useCeramicContext';

export type UseRemoveCAIP10LinkArgs = {
  opts?: UpdateOpts;
};

export type UseRemoveCAIP10LinkConfig = UseMutationOptions<
  void,
  Error,
  MutationArgs
>;

type MutationArgs = UseRemoveCAIP10LinkArgs & {
  client: CeramicClient;
  signer: Signer;
};

const mutationKey = (args: MutationArgs) =>
  ['ceramic', 'remove-caip10-link', args] as const;

const mutationFn: MutationFunction<void, MutationArgs> = async ({
  client,
  signer,
  opts,
}) => {
  const address = await signer.getAddress();
  const authProvider = new EthereumAuthProvider(signer, address);
  const accountId = await authProvider.accountId();
  const accountLink = await Caip10Link.fromAccount(client, accountId, opts);
  await accountLink.clearDid(authProvider, opts);
};

export const useRemoveCAIP10Link = ({
  opts,
  ...config
}: UseRemoveCAIP10LinkArgs & UseRemoveCAIP10LinkConfig = {}) => {
  const { client, signer } = useCeramicContext();

  if (!signer) {
    throw new Error('No signer provided');
  }

  const mutKey = mutationKey({ client, signer, opts });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const create = (args: UseRemoveCAIP10LinkArgs = {}) => {
    return mutate({ client, signer, opts: opts ?? args.opts });
  };

  const createAsync = async (args: UseRemoveCAIP10LinkArgs = {}) => {
    return mutateAsync({ client, signer, opts: opts ?? args.opts });
  };

  return {
    create,
    createAsync,
    ...mutation,
  };
};
