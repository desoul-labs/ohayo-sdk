import { CeramicClient } from '@ceramicnetwork/http-client';
import { DIDSession } from 'did-session';
import { Signer } from 'ethers';
import { createContext } from 'react';

export type CeramicContextValue = {
  client?: CeramicClient;
  signer?: Signer;
  session?: DIDSession;
  setSession: (session?: DIDSession) => void;
};

export const CeramicContext = createContext<CeramicContextValue>({
  client: undefined,
  session: undefined,
  setSession: () => {},
});
