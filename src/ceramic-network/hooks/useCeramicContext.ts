import { useContext } from 'react';
import { CeramicContext } from '../contexts/CeramicContext';

export const useCeramicContext = () => {
  const { client, signer, session, setSession } = useContext(CeramicContext);
  if (!client) {
    throw new Error('This hook must be used within a CeramicProvider');
  }

  return {
    client,
    signer,
    session,
    setSession,
  };
};
