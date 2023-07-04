import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { SessionKeyPair, SessionSigsMap } from '@lit-protocol/types';
import { createContext } from 'react';

export type LitContextValue = {
  client?: LitNodeClient;
  contracts?: LitContracts;
  setContracts: (contracts?: LitContracts) => void;
  sessionSigs?: SessionSigsMap;
  setSessionSigs: (sessionSigs?: SessionSigsMap) => void;
  sessionKey?: SessionKeyPair;
  setSessionKey: (sessionKey?: SessionKeyPair) => void;
};

export const LitContext = createContext<LitContextValue>({
  client: undefined,
  contracts: undefined,
  setContracts: () => {},
  sessionSigs: undefined,
  setSessionSigs: () => {},
  sessionKey: undefined,
  setSessionKey: () => {},
});
