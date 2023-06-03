import {
  CeramicClient,
  CeramicClientConfig,
} from '@ceramicnetwork/http-client';
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum';
import { DIDSession } from 'did-session';
import { Signer } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { CeramicContext, InitClientOptions } from '../contexts/CeramicContext';

export type CeramicProviderProps = {
  networkUrl?: string;
} & Partial<CeramicClientConfig>;

export const CeramicProvider: React.FC<
  React.PropsWithChildren<CeramicProviderProps>
> = ({ children, networkUrl, ...configs }) => {
  const [client, setClient] = useState<CeramicClient>();
  const [session, setSession] = useState<DIDSession>();

  const initClient = useCallback(
    async (signer: Signer, options: InitClientOptions) => {
      if (client) {
        return client;
      }

      try {
        const address = await signer.getAddress();
        const accountId = await getAccountId(signer, address);
        const authMethod = await EthereumWebAuth.getAuthMethod(
          signer,
          accountId,
        );

        const ceramic = new CeramicClient(
          networkUrl || 'https://ceramic-clay.3boxlabs.com',
          configs,
        );

        if (!session || (session.hasSession && session.isExpired)) {
          const didSession = await DIDSession.authorize(authMethod, options);
          ceramic.did = didSession.did;

          setSession(didSession);
        }

        setClient(ceramic);
        return ceramic;
      } catch (e) {
        setClient(undefined);
        throw e;
      }
    },
    [client, configs, networkUrl, session],
  );

  const closeClient = useCallback(async () => {
    if (client) {
      await client.close();
    }
    setClient(undefined);
    setSession(undefined);
  }, [client]);

  const value = useMemo(
    () => ({
      client,
      closeClient,
      initClient,
      session,
    }),
    [client, closeClient, initClient, session],
  );

  return (
    <CeramicContext.Provider value={value}>{children}</CeramicContext.Provider>
  );
};
