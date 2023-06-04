import { Chain } from '@wagmi/chains';
import * as wc from '@walletconnect/react-native-dapp';
import { ISessionStatus } from '@walletconnect/types';
import { Wallet, providers, utils } from 'ethers';
import * as Device from 'expo-device';
import { useCallback, useMemo, useState } from 'react';

// TODO: use context to store the wallet
export const useEthersWallet = () => {
  return useMemo(() => {
    if (!Device.isDevice) {
      const provider = new providers.InfuraProvider(137);
      return new Wallet('some-private-key', provider);
    }
  }, []);
};

export const useWalletConnect = () => {
  const connector = wc.useWalletConnect();
  const wallet = useEthersWallet();
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
        if (wallet) {
          setIsConnected(true);
          return {
            accounts: [wallet.address],
            chainId: chain.id,
            networkId: chain.id,
            rpcUrl: chain.rpcUrls.default.http[0],
          } as ISessionStatus;
        } else {
          const { accounts, ...data } = await connector.connect({
            chainId: chain.id,
          });
          setIsConnected(true);
          return {
            accounts: accounts.map(addr => utils.getAddress(addr)),
            ...data,
          };
        }
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
    [connector, wallet],
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
    wallet,
    session: connector.session,
    error,
    isConnected,
    isError,
    isPending,
  };
};
