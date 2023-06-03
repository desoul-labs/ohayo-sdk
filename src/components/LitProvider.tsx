import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  AuthCallback,
  CustomNetwork,
  LitNodeClientConfig,
  SessionSig,
  SessionSigsMap,
} from '@lit-protocol/types';
import { Signer } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { SiweMessage } from 'siwe';
import {
  InitClientOptions,
  InitClientResults,
  LitContext,
} from 'src/contexts/LitContext';

export type LitProviderProps = Partial<LitNodeClientConfig & CustomNetwork>;

export const LitProvider: React.FC<
  React.PropsWithChildren<LitProviderProps>
> = ({ children, ...configs }) => {
  const [client, setClient] = useState<LitNodeClient>();
  const [sessionSigs, setSessionSigs] = useState<SessionSigsMap>();

  const initClient = useCallback(
    async (signer: Signer, options: InitClientOptions) => {
      if (client && sessionSigs) {
        return { client, sessionSigs };
      }

      try {
        const defaultExpiration = new Date(
          Date.now() + 1000 * 60 * 60 * 24,
        ).toISOString();

        const authNeededCallback: AuthCallback = async params => {
          const address = await signer.getAddress();
          const message = new SiweMessage({
            domain: window.location.host,
            address,
            statement: 'Sign a session key to use with Lit Protocol',
            uri: params.uri,
            version: '1',
            chainId: await signer.getChainId(),
            expirationTime: options.expiration ?? defaultExpiration,
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

        const litNodeClient = new LitNodeClient(configs);
        await litNodeClient.connect();
        setClient(litNodeClient);

        const sessionSigs = await litNodeClient.getSessionSigs({
          ...options,
          authNeededCallback: options.authNeededCallback ?? authNeededCallback,
          expiration: options.expiration ?? defaultExpiration,
        });
        setSessionSigs(sessionSigs);

        return {
          client: litNodeClient,
          sessionSigs: sessionSigs,
        } as InitClientResults;
      } catch (e) {
        setClient(undefined);
        throw e;
      }
    },
    [sessionSigs, client, configs],
  );

  const closeClient = useCallback(async () => {
    setClient(undefined);
    setSessionSigs(undefined);
  }, []);

  const value = useMemo(
    () => ({
      client,
      initClient,
      closeClient,
      sessionSigs,
    }),
    [client, initClient, closeClient, sessionSigs],
  );

  return <LitContext.Provider value={value}>{children}</LitContext.Provider>;
};
