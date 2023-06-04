import { useCeramicContext } from '../useCeramicContext';

export const useDID = () => {
  const { session } = useCeramicContext();

  return session?.did;
};
