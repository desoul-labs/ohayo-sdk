import { useWalletConnect } from '@walletconnect/react-native-dapp';
import { BigNumber, TypedDataDomain, TypedDataField, utils } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProvider } from './useProvider';
import { useEthersWallet } from './useWalletConnect';

export const useAccount = () => {
  const connector = useWalletConnect();
  const wallet = useEthersWallet();

  const data = useMemo(() => {
    if (wallet) {
      return {
        address: wallet.address,
        isConnected: true,
        isDisconnected: false,
        isPending: false,
        isIdle: true,
      };
    }
    return {
      address: connector.accounts[0]
        ? utils.getAddress(connector.accounts[0])
        : undefined,
      isConnected: connector.connected,
      isDisconnected: !connector.connected,
      isPending: connector.pending,
      isIdle: !connector.pending,
    };
  }, [connector, wallet]);

  return data;
};

export const useBalance = (address: string) => {
  const provider = useProvider();

  const [balance, setBalance] = useState<BigNumber>();

  useEffect(() => {
    const getBalance = async () => {
      if (!provider) {
        return;
      }

      try {
        setBalance(await provider.getBalance(address));
      } catch (e) {
        console.log(e);
        setBalance(undefined);
      }
    };

    getBalance();
  }, [provider, address]);

  return balance;
};

export const useSigner = () => {
  const provider = useProvider();
  const wallet = useEthersWallet();

  return wallet ?? provider?.getSigner();
};

export const useSignMessage = () => {
  const connector = useWalletConnect();
  const wallet = useEthersWallet();

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string>();

  const signMessage = useCallback(
    async (message: string) => {
      setIsPending(true);
      try {
        let sig: string;
        if (wallet) {
          sig = await wallet.signMessage(message);
        } else {
          sig = await connector.signPersonalMessage([
            message,
            utils.getAddress(connector.accounts[0]),
          ]);
        }
        setSignature(sig);

        setIsSuccess(true);
        return sig;
      } catch (e) {
        setIsError(true);
        if (e instanceof Error) {
          setError(e);
        }
      } finally {
        setIsPending(false);
      }
    },
    [connector, wallet],
  );

  return {
    signMessage,
    signature,
    error,
    isPending,
    isSuccess,
    isError,
  };
};

export const useSignTypedData = () => {
  const connector = useWalletConnect();
  const wallet = useEthersWallet();

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string>();

  const signTypedData = useCallback(
    async (
      domain: TypedDataDomain,
      types: Record<string, TypedDataField[]>,
      value: Record<string, any>,
    ) => {
      setIsPending(true);
      try {
        let sig: string;
        if (wallet) {
          sig = await wallet._signTypedData(domain, types, value);
        } else {
          const data = utils._TypedDataEncoder.getPayload(domain, types, value);
          sig = await connector.signTypedData([
            utils.getAddress(connector.accounts[0]),
            data,
          ]);
        }
        setSignature(sig);

        setIsSuccess(true);
        return sig;
      } catch (e) {
        setIsError(true);
        if (e instanceof Error) {
          setError(e);
        }
      } finally {
        setIsPending(false);
      }
    },
    [connector, wallet],
  );

  return {
    signTypedData,
    signature,
    error,
    isPending,
    isSuccess,
    isError,
  };
};
