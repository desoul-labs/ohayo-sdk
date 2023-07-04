import { LitContracts } from '@lit-protocol/contracts-sdk';
import { PKPNFT } from '@lit-protocol/contracts-sdk/src/abis/PKPNFT';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPEthersWalletProp, SessionSigsMap } from '@lit-protocol/types';
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { useLitContext } from '../useLitContext';

export type UsePKPWalletArgs = {
  pkpId: string;
  opts?: Omit<PKPEthersWalletProp, 'pkpPubKey' | 'controllerSessionSigs'>;
};

export type PKPWalletResult = {
  wallet: PKPEthersWallet;
};

export type UsePKPWalletConfig = UseQueryOptions<
  PKPWalletResult,
  Error,
  PKPWalletResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UsePKPWalletArgs & {
  contracts: LitContracts;
  sessionSigs: SessionSigsMap;
};

const queryKey = (args: QueryArgs) => ['lit', 'pkp-wallet', args] as const;

const queryFn: QueryFunction<
  PKPWalletResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { contracts, sessionSigs, pkpId, opts }] }) => {
  const pkpPubKey = await (contracts.pkpNftContract.read as PKPNFT).getPubkey(
    pkpId,
  );

  const pkpWallet = new PKPEthersWallet({
    pkpPubKey,
    controllerSessionSigs: sessionSigs,
    ...opts,
  });
  await pkpWallet.init();

  return { wallet: pkpWallet };
};

export const usePKPWallet = ({
  pkpId,
  opts,
  ...config
}: UsePKPWalletArgs & UsePKPWalletConfig) => {
  const { contracts, sessionSigs } = useLitContext();
  if (!contracts) {
    throw new Error('Contracts not initialized');
  }
  if (!sessionSigs) {
    throw new Error('Session sigs not initialized');
  }

  const qryKey = queryKey({ contracts, sessionSigs, pkpId, opts });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
