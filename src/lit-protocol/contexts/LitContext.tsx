import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  GetSessionSigsProps,
  SessionKeyPair,
  SessionSigsMap,
} from '@lit-protocol/types';
import { createContext } from 'react';
import { O } from 'ts-toolbelt';

export type InitClientOptions = O.Undefinable<
  GetSessionSigsProps,
  'expiration' | 'sessionKey'
>;

export type InitClientResults = {
  client: LitNodeClient;
  sessionSigs: SessionSigsMap;
};

export type LitContextValue = {
  client?: LitNodeClient | undefined;
  sessionSigs?: SessionSigsMap;
  setSessionSigs: (sessionSigs?: SessionSigsMap) => void;
  sessionKey?: SessionKeyPair;
  setSessionKey: (sessionKey?: SessionKeyPair) => void;
};

export const LitContext = createContext<LitContextValue>({
  client: undefined,
  sessionSigs: undefined,
  setSessionSigs: () => {},
  sessionKey: undefined,
  setSessionKey: () => {},
});
