import { Chain } from '@wagmi/chains';
import * as wc from '@walletconnect/react-native-dapp';
import { ISessionStatus } from '@walletconnect/types';
import { utils } from 'ethers';
import { useCallback, useState } from 'react';

export const useWalletConnect = () => {
  const connector = wc.useWalletConnect();
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const connect = useCallback(
    async (chain: Chain) => {
      if (connector.connected) {
        setIsConnected(true);
        return {
          accounts: connector.accounts.map(addr => utils.getAddress(addr)),
          chainId: connector.chainId,
          networkId: connector.networkId,
          rpcUrl: connector.rpcUrl,
        } as ISessionStatus;
      }

      setIsPending(true);
      try {
        const { accounts, ...data } = await connector.connect({
          chainId: chain.id,
        });
        setIsConnected(true);
        return {
          accounts: accounts.map(addr => utils.getAddress(addr)),
          ...data,
        };
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
    [connector],
  );

  const disconnect = useCallback(async () => {
    if (!connector.connected) {
      return;
    }

    setIsPending(true);
    try {
      await connector.killSession();

      setIsConnected(false);
    } catch (e) {
      setIsError(true);
      if (e instanceof Error) {
        setError(e);
      }

      throw e;
    } finally {
      setIsPending(false);
    }
  }, [connector]);

  return {
    connect,
    disconnect,
    connector,
    session: connector.session,
    error,
    isConnected,
    isError,
    isPending,
  };
};
