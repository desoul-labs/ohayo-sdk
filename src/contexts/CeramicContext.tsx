import { CeramicClient } from '@ceramicnetwork/http-client';
import { DIDSession } from 'did-session';
import { Signer } from 'ethers';
import { createContext } from 'react';

export type InitClientOptions = {
  domain?: string;
  statement?: string;
  version?: string;
  nonce?: string;
  requestId?: string;
  expirationTime?: string;
  resources: Array<string>;
  expiresInSecs?: number;
};

export type CeramicContextValue = {
  client?: CeramicClient;
  initClient: (
    signer: Signer,
    options: InitClientOptions,
  ) => Promise<CeramicClient | undefined>;
  closeClient: () => Promise<void>;
  session?: DIDSession;
};

export const CeramicContext = createContext<CeramicContextValue>({
  client: undefined,
  closeClient: () => Promise.resolve(undefined),
  initClient: () => Promise.resolve(undefined),
  session: undefined,
});
