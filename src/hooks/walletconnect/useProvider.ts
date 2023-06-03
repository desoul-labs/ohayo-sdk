import { Chain } from '@wagmi/chains';
import { useWalletConnect } from '@walletconnect/react-native-dapp';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { providers } from 'ethers';
import { useEffect, useState } from 'react';
import { useEthersWallet } from './useWalletConnect';

export const useProvider = (chain?: Chain) => {
  const connector = useWalletConnect();
  const wallet = useEthersWallet();

  const [provider, setProvider] = useState<providers.JsonRpcProvider>();

  useEffect(() => {
    const getProvider = async () => {
      try {
        const web3 = new WalletConnectProvider({
          rpc: chain
            ? { [chain.id]: chain.rpcUrls[0].http[0] }
            : { [connector.chainId]: connector.rpcUrl },
          clientMeta: connector.clientMeta ?? undefined,
          chainId: chain?.id ?? connector.chainId,
          connector,
          qrcode: false,
        });
        await web3.enable();

        setProvider(new providers.Web3Provider(web3));
      } catch (e) {
        console.log(e);
        setProvider(undefined);
      }
    };

    if (!wallet) {
      getProvider();
    }
  }, [chain, connector, wallet]);

  if (wallet) {
    return wallet.provider as providers.JsonRpcProvider;
  }

  return provider;
};
