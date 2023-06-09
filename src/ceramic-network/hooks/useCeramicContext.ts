import { useContext } from 'react';
import { CeramicContext } from '../contexts/CeramicContext';

export const useCeramicContext = () => {
  const { client, ...rest } = useContext(CeramicContext);
  if (!client) {
    throw new Error('This hook must be used within a CeramicProvider');
  }

  return {
    client,
    ...rest,
  };
};
