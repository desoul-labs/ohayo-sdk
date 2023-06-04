import { CeramicClient } from '@ceramicnetwork/http-client';
import { DIDSession } from 'did-session';
import { createContext } from 'react';

export type CeramicContextValue = {
  client?: CeramicClient;
  session?: DIDSession;
  setSession: (session?: DIDSession) => void;
};

export const CeramicContext = createContext<CeramicContextValue>({
  client: undefined,
  session: undefined,
  setSession: () => {},
});
