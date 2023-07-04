import { LitContracts } from '@lit-protocol/contracts-sdk';
import { PKPNFT } from '@lit-protocol/contracts-sdk/src/abis/PKPNFT';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { useLitContext } from '../useLitContext';

export type MintPKPResult = {
  txHash: string;
  pkpId: string;
  pubKey: string;
};

export type UseMintPKPConfig = UseMutationOptions<MintPKPResult, Error, {}>;

type MutationArgs = {
  contracts: LitContracts;
};

const mutationKey = (args: MutationArgs) => ['lit', 'mint-pkp', args] as const;

const mutationFn: MutationFunction<MintPKPResult, MutationArgs> = async ({
  contracts,
}) => {
  const { tokenId, tx } = await contracts.pkpNftContractUtil.write.mint();
  const pubKey = await (contracts.pkpNftContract.read as PKPNFT).getPubkey(
    tokenId,
  );

  return {
    txHash: tx.hash,
    pkpId: tokenId,
    pubKey,
  };
};

export const useMintPKP = ({ ...config }: UseMintPKPConfig = {}) => {
  const { contracts } = useLitContext();
  if (!contracts) {
    throw new Error('Contracts not initialized');
  }

  const mutKey = mutationKey({ contracts });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const mint = () => mutate({ contracts });

  const mintAsync = async () => await mutateAsync({ contracts });

  return {
    mint,
    mintAsync,
    ...mutation,
  };
};
