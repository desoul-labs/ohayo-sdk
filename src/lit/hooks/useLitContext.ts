import { useContext } from 'react';
import { LitContext } from 'src/lit/contexts/LitContext';

export const useLitContext = () => {
  const { client, setSessionSigs, sessionSigs, setSessionKey, sessionKey } =
    useContext(LitContext);
  if (!client) {
    throw new Error('This hook must be used within a LitProvider');
  }

  return {
    client,
    setSessionSigs,
    sessionSigs,
    setSessionKey,
    sessionKey,
  };
};
