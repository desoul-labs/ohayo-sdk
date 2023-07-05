import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  AuthCallback,
  GetSessionSigsProps,
  SessionKeyPair,
  SessionSig,
  SessionSigsMap,
} from '@lit-protocol/types';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { Signer } from 'ethers';
import { SiweMessage } from 'siwe';
import { useLitContext } from '../useLitContext';

export type UseConnectArgs = Partial<{
  signer: Signer;
  opts: Partial<GetSessionSigsProps>;
}>;

export type ConnectResult = {
  sessionKey: SessionKeyPair;
  sessionSigs: SessionSigsMap;
};

export type UseConnectConfig = UseMutationOptions<
  ConnectResult,
  Error,
  UseConnectArgs
>;

type MutationArgs = {
  client: LitNodeClient;
  setContracts: (contracts: LitContracts) => void;
} & UseConnectArgs;

const mutationKey = (args: MutationArgs) => ['lit', 'connect', args] as const;

const mutationFn: MutationFunction<ConnectResult, MutationArgs> = async ({
  client,
  setContracts,
  signer,
  opts,
}) => {
  if (!signer) {
    throw new Error('No signer provided');
  }

  await client.connect();

  const authNeededCallback: AuthCallback = async params => {
    const address = await signer.getAddress();
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign a session key to use with Lit Protocol',
      uri: params.uri,
      version: '1',
      chainId: await signer.getChainId(),
      expirationTime: params.expiration,
      resources: params.resources,
    });
    const toSign = message.prepareMessage();
    const signature = await signer.signMessage(toSign);
    const sig: SessionSig = {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: toSign,
      address,
    };

    return sig;
  };
  const sessionKey = opts?.sessionKey ?? client.getSessionKey();

  const sessionSigs = await client.getSessionSigs({
    sessionKey,
    authNeededCallback,
    chain: 'ethereum',
    resourceAbilityRequests: [],
    ...opts,
  });

  const contracts = new LitContracts({ signer });
  await contracts.connect();
  setContracts(contracts);

  return {
    sessionKey,
    sessionSigs,
  };
};

export const useConnect = ({
  signer,
  opts,
  ...config
}: UseConnectArgs & UseConnectConfig = {}) => {
  const { client, setContracts, sessionKey, setSessionKey, setSessionSigs } =
    useLitContext();

  const mutKey = mutationKey({ client, setContracts, signer, opts });
  const { mutate, mutateAsync, ...mutation } = useMutation(mutKey, mutationFn, {
    ...config,
    onSuccess: (data, variables, option) => {
      if (data?.sessionKey && data?.sessionSigs) {
        setSessionKey(data.sessionKey);
        setSessionSigs(data.sessionSigs);
      }
      config.onSuccess?.(data, variables, option);
    },
  });

  const connect = (args: UseConnectArgs = {}) =>
    mutate({
      client,
      setContracts,
      signer: signer ?? args.signer,
      opts: {
        sessionKey,
        ...(opts ?? args.opts),
      },
    });

  const connectAsync = async (args: UseConnectArgs = {}) =>
    await mutateAsync({
      client,
      setContracts,
      signer: signer ?? args.signer,
      opts: {
        sessionKey,
        ...(opts ?? args.opts),
      },
    });

  return {
    connect,
    connectAsync,
    ...mutation,
  };
};
