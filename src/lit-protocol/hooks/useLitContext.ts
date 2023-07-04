import { useContext } from 'react';
import { LitContext } from '../contexts/LitContext';

export const useLitContext = () => {
  const { client, ...rest } = useContext(LitContext);
  if (!client) {
    throw new Error('This hook must be used within a LitProvider');
  }

  return {
    client,
    ...rest,
  };
};
