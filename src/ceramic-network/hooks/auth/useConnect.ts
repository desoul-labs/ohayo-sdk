import { CeramicClient } from '@ceramicnetwork/http-client';
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { DIDSession } from 'did-session';
import { Signer } from 'ethers';
import { U } from 'ts-toolbelt';
import { useCeramicContext } from '../useCeramicContext';

export type ConnectOptions = {
  session?: string | DIDSession;
} & U.NonNullable<Parameters<typeof DIDSession.authorize>[1]>;

export type UseConnectArgs = Partial<{
  signer: Signer;
  opts: ConnectOptions;
}>;

export type ConnectResult = {
  session: DIDSession;
};

export type UseConnectConfig = UseMutationOptions<
  ConnectResult,
  Error,
  UseConnectArgs
>;

type MutationArgs = {
  client: CeramicClient;
} & UseConnectArgs;

const mutationKey = (args: MutationArgs) =>
  ['ceramic', 'connect', args] as const;

const mutationFn: MutationFunction<ConnectResult, MutationArgs> = async ({
  client,
  signer,
  opts,
}) => {
  if (opts?.session) {
    const didSession =
      typeof opts.session === 'string'
        ? await DIDSession.fromSession(opts.session)
        : opts.session;
    if (didSession.hasSession && !didSession.isExpired) {
      client.setDID(didSession.did);
      return {
        session: didSession,
      };
    }
  }

  if (!signer) {
    throw new Error('No signer provided');
  }

  const address = await signer.getAddress();
  const accountId = await getAccountId(signer, address);
  const authMethod = await EthereumWebAuth.getAuthMethod(signer, accountId);

  const newSession = await DIDSession.authorize(authMethod, opts);
  client.setDID(newSession.did);
  return {
    session: newSession,
  };
};

export const useConnect = ({
  signer: signer_,
  opts,
  ...config
}: UseConnectArgs & UseConnectConfig = {}) => {
  const { client, session, setSession } = useCeramicContext();

  const mutKey = mutationKey({
    client,
    signer: signer_,
    opts: {
      session,
      ...opts,
    },
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(mutKey, mutationFn, {
    ...config,
    onSuccess: (data, variables, options) => {
      if (data?.session) {
        setSession(data.session);
      }
      config.onSuccess?.(data, variables, options);
    },
  });

  const connect = (signer?: Signer, options?: ConnectOptions) =>
    mutate({
      client,
      signer: signer_ ?? signer,
      opts: {
        session,
        ...options,
        ...opts,
      },
    });

  const connectAsync = async (signer?: Signer, options?: ConnectOptions) =>
    await mutateAsync({
      client,
      signer: signer_ ?? signer,
      opts: {
        session,
        ...options,
        ...opts,
      },
    });

  return {
    connect,
    connectAsync,
    ...mutation,
  };
};
