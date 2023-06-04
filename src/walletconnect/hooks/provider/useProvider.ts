import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { Chain } from '@wagmi/chains';
import WalletConnect from '@walletconnect/client';
import { useWalletConnect } from '@walletconnect/react-native-dapp';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { providers } from 'ethers';

export type UseProviderArgs = {
  chain?: Chain;
};

export type ProviderResult = {
  provider: providers.JsonRpcProvider;
};

export type UseProviderConfig = UseQueryOptions<
  ProviderResult,
  Error,
  ProviderResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseProviderArgs & {
  connector: WalletConnect;
};

const queryKey = (args: QueryArgs) =>
  ['walletconnect', 'provider', args] as const;

const queryFn: QueryFunction<
  ProviderResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { chain, connector }] }) => {
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

  return {
    provider: new providers.Web3Provider(web3),
  };
};

export const useProvider = ({
  chain,
  ...config
}: UseProviderArgs & UseProviderConfig = {}) => {
  const connector = useWalletConnect();

  const qryKey = queryKey({ chain, connector });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
