import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { ContractTransaction } from 'ethers';
import { useLitContext } from '../useLitContext';

export type UseGrantPKPPermissionArgs = Partial<{
  pkpId: string;
  user: string;
  action: string;
  // TODO: authMethod and scope
}>;

export type GrantPKPPermissionResult = {
  txHash: string;
};

export type UseGrantPKPPermissionConfig = UseMutationOptions<
  GrantPKPPermissionResult,
  Error,
  UseGrantPKPPermissionArgs
>;

type MutationArgs = UseGrantPKPPermissionArgs & {
  contracts: LitContracts;
};

const mutationKey = (args: MutationArgs) =>
  ['lit', 'grant-pkp-permission', args] as const;

const mutationFn: MutationFunction<
  GrantPKPPermissionResult,
  MutationArgs
> = async ({ contracts, pkpId, user, action }) => {
  if (!pkpId) {
    throw new Error('Missing pkpId');
  }

  let tx: ContractTransaction;
  if (user) {
    tx = await contracts.pkpPermissionsContractUtil.write.addPermittedAddress(
      pkpId,
      user,
    );
    await tx.wait();
  } else if (action) {
    tx = await contracts.pkpPermissionsContractUtil.write.addPermittedAction(
      pkpId,
      action,
    );
    await tx.wait();
  } else {
    throw new Error('Missing user or action');
  }

  return {
    txHash: tx.hash,
  };
};

export const useGrantPKPPermission = ({
  pkpId: pkpId_,
  user: user_,
  action: action_,
  ...config
}: UseGrantPKPPermissionArgs & UseGrantPKPPermissionConfig = {}) => {
  const { contracts } = useLitContext();
  if (!contracts) {
    throw new Error('Contracts not initialized');
  }

  const mutKey = mutationKey({
    contracts,
    pkpId: pkpId_,
    user: user_,
    action: action_,
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const grantUser = (pkpId: string, user: string) =>
    mutate({
      contracts,
      pkpId: pkpId_ ?? pkpId,
      user: user_ ?? user,
    });

  const grantUserAsync = async (pkpId: string, user: string) =>
    await mutateAsync({
      contracts,
      pkpId: pkpId_ ?? pkpId,
      user: user_ ?? user,
    });

  const grantAction = (pkpId: string, action: string) =>
    mutate({
      contracts,
      pkpId: pkpId_ ?? pkpId,
      action: action_ ?? action,
    });

  const grantActionAsync = async (pkpId: string, action: string) =>
    await mutateAsync({
      contracts,
      pkpId: pkpId_ ?? pkpId,
      action: action_ ?? action,
    });

  return {
    grantUser,
    grantUserAsync,
    grantAction,
    grantActionAsync,
    ...mutation,
  };
};
