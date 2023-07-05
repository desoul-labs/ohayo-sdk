import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking';
import { CreateOpts } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { Signer } from 'ethers';
import { useCeramicContext } from '../useCeramicContext';

export type UseCreateCAIP10LinkArgs = {
  opts?: CreateOpts;
};

export type CreateCAIP10LinkResult = {
  link: Caip10Link;
};

export type UseCreateCAIP10LinkConfig = UseMutationOptions<
  CreateCAIP10LinkResult,
  Error,
  MutationArgs
>;

type MutationArgs = UseCreateCAIP10LinkArgs & {
  client: CeramicClient;
  signer: Signer;
};

const mutationKey = (args: MutationArgs) =>
  ['ceramic', 'create-caip10-link', args] as const;

const mutationFn: MutationFunction<
  CreateCAIP10LinkResult,
  MutationArgs
> = async ({ client, signer, opts }) => {
  const address = await signer.getAddress();
  const authProvider = new EthereumAuthProvider(signer, address);
  const accountId = await authProvider.accountId();
  const accountLink = await Caip10Link.fromAccount(client, accountId, opts);

  if (!client.did) {
    throw new Error('No DID found');
  }
  await accountLink.setDid(client.did, authProvider, opts);

  return {
    link: accountLink,
  };
};

export const useCreateCAIP10Link = ({
  opts,
  ...config
}: UseCreateCAIP10LinkArgs & UseCreateCAIP10LinkConfig = {}) => {
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

  const create = (args: UseCreateCAIP10LinkArgs = {}) => {
    return mutate({ client, signer, opts: opts ?? args.opts });
  };

  const createAsync = async (args: UseCreateCAIP10LinkArgs = {}) => {
    return mutateAsync({ client, signer, opts: opts ?? args.opts });
  };

  return {
    create,
    createAsync,
    ...mutation,
  };
};
