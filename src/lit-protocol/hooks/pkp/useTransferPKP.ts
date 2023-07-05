import { LitContracts } from '@lit-protocol/contracts-sdk';
import { PKPNFT } from '@lit-protocol/contracts-sdk/src/abis/PKPNFT';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { useLitContext } from '../useLitContext';

export type UseTransferPKPArgs = Partial<{
  to: string;
  pkpId: string;
}>;

export type TransferPKPResult = {
  txHash: string;
};

export type UseTransferPKPConfig = UseMutationOptions<
  TransferPKPResult,
  Error,
  UseTransferPKPArgs
>;

type MutationArgs = UseTransferPKPArgs & {
  contracts: LitContracts;
};

const mutationKey = (args: MutationArgs) =>
  ['lit', 'transfer-pkp', args] as const;

const mutationFn: MutationFunction<TransferPKPResult, MutationArgs> = async ({
  contracts,
  to,
  pkpId,
}) => {
  if (!to) {
    throw new Error('Missing to address');
  }
  if (!pkpId) {
    throw new Error('Missing pkpId');
  }

  const from = await contracts.signer.getAddress();
  const tx = await (contracts.pkpNftContract.write as PKPNFT).transferFrom(
    from,
    to,
    pkpId,
  );

  return {
    txHash: tx.hash,
  };
};

export const useTransferPKP = ({
  to,
  pkpId,
  ...config
}: UseTransferPKPArgs & UseTransferPKPConfig = {}) => {
  const { contracts } = useLitContext();
  if (!contracts) {
    throw new Error('Contracts not initialized');
  }

  const mutKey = mutationKey({ contracts, to, pkpId });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const transfer = (args: UseTransferPKPArgs = {}) =>
    mutate({
      contracts,
      to: to ?? args.to,
      pkpId: pkpId ?? args.pkpId,
    });

  const transferAsync = async (args: UseTransferPKPArgs = {}) =>
    await mutateAsync({
      contracts,
      to: to ?? args.to,
      pkpId: pkpId ?? args.pkpId,
    });

  return {
    transfer,
    transferAsync,
    ...mutation,
  };
};
