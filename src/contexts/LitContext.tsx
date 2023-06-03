import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  GetSessionSigsProps,
  SessionKeyPair,
  SessionSigsMap,
} from '@lit-protocol/types';
import { Signer } from 'ethers';
import { createContext } from 'react';

export type InitClientOptions = Omit<
  GetSessionSigsProps,
  'expiration' | 'sessionKey'
> & {
  expiration?: string;
  sessionKey?: SessionKeyPair;
};

export type InitClientResults = {
  client: LitNodeClient;
  sessionSigs: SessionSigsMap;
};

export type LitContextValue = {
  client?: LitNodeClient | undefined;
  initClient: (
    signer: Signer,
    options: InitClientOptions,
  ) => Promise<InitClientResults | undefined>;
  closeClient: () => Promise<void>;
  sessionSigs?: SessionSigsMap;
};

export const LitContext = createContext<LitContextValue>({
  client: undefined,
  initClient: () => Promise.resolve(undefined),
  closeClient: () => Promise.resolve(undefined),
  sessionSigs: undefined,
});
