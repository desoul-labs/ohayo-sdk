import { Signer } from 'ethers';
import { useCallback, useContext, useState } from 'react';
import {
  CeramicContext,
  InitClientOptions,
} from '../../contexts/CeramicContext';

export const useCeramic = () => {
  const { client, closeClient, initClient, session } =
    useContext(CeramicContext);

  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(
    async (signer: Signer, options: InitClientOptions) => {
      setIsPending(true);
      try {
        const ceramic = await initClient(signer, options);
        setIsSuccess(true);
        return ceramic;
      } catch (e) {
        setIsError(true);
        if (e instanceof Error) {
          setError(e);
        }

        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [initClient],
  );

  const disconnect = useCallback(async () => {
    setIsPending(true);
    try {
      await closeClient();
      setIsSuccess(true);
    } catch (e) {
      setIsError(true);
      if (e instanceof Error) {
        setError(e);
      }
    } finally {
      setIsPending(false);
    }
  }, [closeClient]);

  return {
    client,
    connect,
    disconnect,
    error,
    isError,
    isSuccess,
    isPending,
    session,
  };
};
