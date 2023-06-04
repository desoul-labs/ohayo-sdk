import { useWalletConnect } from '@walletconnect/react-native-dapp';
import { BigNumber, TypedDataDomain, TypedDataField, utils } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProvider } from '../provider/useProvider';

export const useAccount = () => {
  const connector = useWalletConnect();

  const data = useMemo(() => {
    return {
      address: connector.accounts[0]
        ? utils.getAddress(connector.accounts[0])
        : undefined,
      isConnected: connector.connected,
      isDisconnected: !connector.connected,
      isPending: connector.pending,
      isIdle: !connector.pending,
    };
  }, [connector]);

  return data;
};

export const useBalance = (address: string) => {
  const { data } = useProvider();

  const [balance, setBalance] = useState<BigNumber>();

  useEffect(() => {
    const getBalance = async () => {
      if (!data?.provider) {
        return;
      }

      try {
        setBalance(await data?.provider.getBalance(address));
      } catch (e) {
        console.log(e);
        setBalance(undefined);
      }
    };

    getBalance();
  }, [address, data?.provider]);

  return balance;
};

export const useSigner = () => {
  const { data } = useProvider();

  return data?.provider?.getSigner();
};

export const useSignMessage = () => {
  const connector = useWalletConnect();

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string>();

  const signMessage = useCallback(
    async (message: string) => {
      setIsPending(true);
      try {
        const sig = await connector.signPersonalMessage([
          message,
          utils.getAddress(connector.accounts[0]),
        ]);
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
    [connector],
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

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string>();

  const signTypedData = useCallback(
    async (
      domain: TypedDataDomain,
      types: Record<string, TypedDataField[]>,
      value: Record<string, unknown>,
    ) => {
      setIsPending(true);
      try {
        const data = utils._TypedDataEncoder.getPayload(domain, types, value);
        const sig = await connector.signTypedData([
          utils.getAddress(connector.accounts[0]),
          data,
        ]);
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
    [connector],
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
