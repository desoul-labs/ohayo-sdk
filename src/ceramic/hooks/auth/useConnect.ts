import { CeramicClient } from '@ceramicnetwork/http-client';
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { DIDSession } from 'did-session';
import { Signer } from 'ethers';
import { useCeramicContext } from '../useCeramicContext';

export type UseConnectArgs = Partial<{
  signer: Signer;
  session: string | DIDSession;
  opts: Parameters<typeof DIDSession.authorize>[1];
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
  session,
  signer,
  opts,
}) => {
  if (session) {
    const didSession =
      typeof session === 'string'
        ? await DIDSession.fromSession(session)
        : session;
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
  signer: argsSigner,
  session,
  opts,
  ...config
}: UseConnectArgs & UseConnectConfig = {}) => {
  const { client, session: savedSession, setSession } = useCeramicContext();

  const mutKey = mutationKey({
    client,
    signer: argsSigner,
    session: session ?? savedSession,
    opts,
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

  const connect = (
    signer?: Signer,
    options?: Parameters<typeof DIDSession.authorize>[1],
  ) =>
    mutate({
      client,
      session: session ?? savedSession,
      signer: argsSigner ?? signer,
      opts: opts ?? options,
    });

  const connectAsync = async (
    signer?: Signer,
    options?: Parameters<typeof DIDSession.authorize>[1],
  ) =>
    await mutateAsync({
      client,
      session: session ?? savedSession,
      signer: argsSigner ?? signer,
      opts: opts ?? options,
    });

  return {
    connect,
    connectAsync,
    ...mutation,
  };
};
