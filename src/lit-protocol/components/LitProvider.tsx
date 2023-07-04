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

  const value = useMemo(
    () => ({
      client,
      setSessionSigs,
      sessionSigs,
      sessionKey,
      setSessionKey,
    }),
    [client, sessionKey, sessionSigs],
  );

  return <LitContext.Provider value={value}>{children}</LitContext.Provider>;
};
