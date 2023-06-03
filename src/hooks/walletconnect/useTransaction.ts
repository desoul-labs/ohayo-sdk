import { useWalletConnect } from '@walletconnect/react-native-dapp';
import { ITxData } from '@walletconnect/types';
import { BigNumberish, Contract, providers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { erc20, erc721 } from 'src/constants/abi';
import { useProvider } from './useProvider';
import { useEthersWallet } from './useWalletConnect';

export const useTransaction = ({ txHash }: { txHash: string }) => {
  const provider = useProvider();

  const [tx, setTx] = useState<providers.TransactionResponse>();

  useEffect(() => {
    const getTransaction = async () => {
      if (!provider) {
        return;
      }

      try {
        const transaction = await provider.getTransaction(txHash);
        setTx(transaction);
      } catch (e) {
        setTx(undefined);
      }
    };

    getTransaction();
  }, [provider, txHash]);

  return tx;
};

export const useSendTransaction = () => {
  const connector = useWalletConnect();
  const wallet = useEthersWallet();

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string>();

  const sendTransaction = useCallback(
    async (
      tx: providers.TransactionRequest = {
        from: wallet ? wallet.address : connector.accounts[0],
      },
    ) => {
      setIsPending(true);
      try {
        let hash: string;
        if (wallet) {
          const resp = await wallet.sendTransaction(tx);
          hash = resp.hash;
        } else {
          hash = await connector.sendTransaction(convertTx(tx));
        }
        setTxHash(hash);

        setIsSuccess(true);
        return hash;
      } catch (e) {
        setIsError(true);
        if (e instanceof Error) {
          setError(e);
        }
      } finally {
        setIsPending(false);
      }
    },
    [wallet, connector],
  );

  return {
    sendTransaction,
    txHash,
    error,
    isPending,
    isSuccess,
    isError,
  };
};

export const useWaitForTransaction = (hash: string) => {
  const provider = useProvider();

  const [receipt, setReceipt] = useState<providers.TransactionReceipt>();

  useEffect(() => {
    const getReceipt = async () => {
      if (!provider) {
        return;
      }

      try {
        const receipt = await provider.waitForTransaction(hash);
        setReceipt(receipt);
      } catch (e) {
        console.log(e);
        setReceipt(undefined);
      }
    };

    getReceipt();
  }, [provider, hash]);

  return receipt;
};

export const useTransfer = () => {
  const connector = useWalletConnect();
  const wallet = useEthersWallet();

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string>();

  const transfer = useCallback(
    async (
      to: string,
      amount: BigNumberish,
      overrides: Omit<providers.TransactionRequest, 'to' | 'value'> = {
        from: wallet ? wallet.address : connector.accounts[0],
      },
    ) => {
      setIsPending(true);
      try {
        let hash: string;
        if (wallet) {
          const resp = await wallet.sendTransaction({
            to,
            value: amount,
            ...overrides,
          });
          hash = resp.hash;
        } else {
          hash = await connector.sendTransaction({
            to,
            value: amount.toString(),
            ...convertTx(overrides),
          });
        }
        setTxHash(hash);

        setIsSuccess(true);
        return hash;
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
    transfer,
    txHash,
    error,
    isPending,
    isSuccess,
    isError,
  };
};

export const useERC20Transfer = ({ address }: { address: string }) => {
  const connector = useWalletConnect();
  const wallet = useEthersWallet();
  const contract = new Contract(address, erc20);

  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [txHash, setTxHash] = useState<string>();

  const transfer = async (
    to: string,
    amount: string,
    overrides: Omit<providers.TransactionRequest, 'to' | 'data'> = {
      from: wallet ? wallet.address : connector.accounts[0],
    },
  ) => {
    setIsPending(true);
    try {
      const data = contract.interface.encodeFunctionData('transfer', [
        to,
        amount,
      ]);

      let hash: string;
      if (wallet) {
        const resp = await wallet.sendTransaction({
          to: address,
          data,
          ...overrides,
        });
        hash = resp.hash;
      } else {
        hash = await connector.sendTransaction({
          to: address,
          data,
          ...convertTx(overrides),
        });
      }
      setTxHash(hash);

      setIsSuccess(true);
      return hash;
    } catch (e) {
      setIsError(true);
      if (e instanceof Error) {
        setError(e);
      }
    } finally {
      setIsPending(false);
    }
  };

  return {
    transfer,
    txHash,
    error,
    isPending,
    isSuccess,
    isError,
  };
};

export const useERC721Transfer = ({ address }: { address: string }) => {
  const connector = useWalletConnect();
  const wallet = useEthersWallet();
  const contract = new Contract(address, erc721);

  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [txHash, setTxHash] = useState<string>();

  const transfer = async (
    to: string,
    tokenId: string,
    overrides: Omit<providers.TransactionRequest, 'to' | 'data'> = {
      from: wallet ? wallet.address : connector.accounts[0],
    },
  ) => {
    setIsPending(true);
    try {
      const data = contract.interface.encodeFunctionData('transferFrom', [
        overrides.from,
        to,
        tokenId,
      ]);

      let hash: string;
      if (wallet) {
        const resp = await wallet.sendTransaction({
          to: address,
          data,
          ...overrides,
        });
        hash = resp.hash;
      } else {
        hash = await connector.sendTransaction({
          to: address,
          data,
          ...convertTx(overrides),
        });
      }
      setTxHash(hash);

      setIsSuccess(true);
      return hash;
    } catch (e) {
      setIsError(true);
      if (e instanceof Error) {
        setError(e);
      }
    } finally {
      setIsPending(false);
    }
  };

  return {
    transfer,
    txHash,
    error,
    isPending,
    isSuccess,
    isError,
  };
};

const convertTx = (tx: providers.TransactionRequest): ITxData => {
  return {
    from: tx.from || '',
    to: tx.to,
    value: tx.value?.toString(),
    data: tx.data?.toString(),
    gas: tx.gasLimit?.toString(),
    gasPrice: tx.gasPrice?.toString(),
    gasLimit: tx.gasLimit?.toString(),
    nonce: tx.nonce?.toString(),
    type: tx.type?.toString(),
  };
};
