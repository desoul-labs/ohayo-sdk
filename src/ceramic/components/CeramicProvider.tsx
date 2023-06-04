import {
  CeramicClient,
  CeramicClientConfig,
} from '@ceramicnetwork/http-client';
import { DIDSession } from 'did-session';
import { useMemo, useState } from 'react';
import { NetworkConfig, testnetClay } from '../configs/networks';
import { CeramicContext } from '../contexts/CeramicContext';

export type CeramicProviderProps = {
  network?: NetworkConfig;
} & Partial<CeramicClientConfig>;

export const CeramicProvider: React.FC<
  React.PropsWithChildren<CeramicProviderProps>
> = ({ children, network, ...configs }) => {
  const client = useMemo(
    () => new CeramicClient(network?.url ?? testnetClay.url, configs),
    [configs, network?.url],
  );

  const [session, setSession] = useState<DIDSession>();

  const value = {
    client,
    session,
    setSession,
  };

  return (
    <CeramicContext.Provider value={value}>{children}</CeramicContext.Provider>
  );
};
