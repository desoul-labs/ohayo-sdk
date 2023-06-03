import { useCallback, useContext, useState } from 'react';
import { LitContext } from 'src/contexts/LitContext';

export type UseLitActionsOptions = Partial<{
  ipfsId: string;
  code: string;
}>;

export type ExecuteOptions = Partial<{
  debug: boolean;
  targetNodeRange: number;
  authMethods: Array<Object>;
}>;

export const useLitActions = ({ ipfsId, code }: UseLitActionsOptions) => {
  const { client, sessionSigs } = useContext(LitContext);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const execute = useCallback(
    async (params: Record<string, any>, opts: ExecuteOptions) => {
      if (!client) {
        setError(new Error('Client is not initialized'));
        setIsError(true);
        setIsPending(false);
        return;
      }

      setIsPending(true);
      try {
        const res = await client.executeJs({
          ipfsId,
          code,
          jsParams: params,
          sessionSigs,
          ...opts,
        });
        setResult(res);

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
    [client, code, ipfsId, sessionSigs],
  );

  return {
    execute,
    client,
    sessionSigs,
    isPending,
    isSuccess,
    isError,
    error,
    result,
  };
};
