import { Signer } from 'ethers';
import { useCallback, useContext, useState } from 'react';
import { InitClientOptions, LitContext } from 'src/contexts/LitContext';

export const useLit = () => {
  const { client, initClient, closeClient, sessionSigs } =
    useContext(LitContext);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(
    async (signer: Signer, options: InitClientOptions) => {
      setIsPending(true);
      try {
        const res = await initClient(signer, options);

        setIsSuccess(true);
        return res;
      } catch (e) {
        if (e instanceof Error) {
          setIsError(true);
          setError(e);
        }
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
      if (e instanceof Error) {
        setIsError(true);
        setError(e);
      }
    } finally {
      setIsPending(false);
    }
  }, [closeClient]);

  return {
    connect,
    disconnect,
    client,
    sessionSigs,
    isPending,
    isSuccess,
    isError,
    error,
  };
};
