import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  LitNodeClientConfig,
  SessionKeyPair,
  SessionSigsMap,
} from '@lit-protocol/types';
import { useMemo, useState } from 'react';
import { NetworkConfig } from '../configs/networks';
import { LitContext } from '../contexts/LitContext';

export type LitProviderProps = {
  network?: NetworkConfig;
} & Partial<Omit<LitNodeClientConfig, 'bootstrapUrls' | 'litNetwork'>>;

export const LitProvider: React.FC<
  React.PropsWithChildren<LitProviderProps>
> = ({ children, ...configs }) => {
  const client = useMemo(() => new LitNodeClient(configs), [configs]);

  const [sessionKey, setSessionKey] = useState<SessionKeyPair>();
  const [sessionSigs, setSessionSigs] = useState<SessionSigsMap>();
  const [contracts, setContracts] = useState<LitContracts>();

  const value = useMemo(
    () => ({
      client,
      contracts,
      setContracts,
      setSessionSigs,
      sessionSigs,
      sessionKey,
      setSessionKey,
    }),
    [client, contracts, sessionKey, sessionSigs],
  );

  return <LitContext.Provider value={value}>{children}</LitContext.Provider>;
};
