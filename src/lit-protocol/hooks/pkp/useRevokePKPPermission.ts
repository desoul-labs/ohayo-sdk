import { LitContracts } from '@lit-protocol/contracts-sdk';
import { PKPPermissions } from '@lit-protocol/contracts-sdk/src/abis/PKPPermissions';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { ContractTransaction } from 'ethers';
import { useLitContext } from '../useLitContext';

export type UseRevokePKPPermissionArgs = Partial<{
  pkpId: string;
  user: string;
  action: string;
  // TODO: authMethod and scope
}>;

export type RevokePKPPermissionResult = {
  txHash: string;
};

export type UseRevokePKPPermissionConfig = UseMutationOptions<
  RevokePKPPermissionResult,
  Error,
  UseRevokePKPPermissionArgs
>;

type MutationArgs = UseRevokePKPPermissionArgs & {
  contracts: LitContracts;
};

const mutationKey = (args: MutationArgs) =>
  ['lit', 'revoke-pkp-permission', args] as const;

const mutationFn: MutationFunction<
  RevokePKPPermissionResult,
  MutationArgs
> = async ({ contracts, pkpId, user, action }) => {
  if (!pkpId) {
    throw new Error('Missing pkpId');
  }

  let tx: ContractTransaction;
  if (user) {
    tx = await (
      contracts.pkpPermissionsContract.write as PKPPermissions
    ).removePermittedAddress(pkpId, user);
    await tx.wait();
  } else if (action) {
    tx = await contracts.pkpPermissionsContractUtil.write.revokePermittedAction(
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

export const useRevokePKPPermission = ({
  pkpId: pkpId_,
  user: user_,
  action: action_,
  ...config
}: UseRevokePKPPermissionArgs & UseRevokePKPPermissionConfig = {}) => {
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

  const revokeUser = (pkpId: string, user: string) =>
    mutate({
      contracts,
      pkpId: pkpId_ ?? pkpId,
      user: user_ ?? user,
    });

  const revokeUserAsync = async (pkpId: string, user: string) =>
    await mutateAsync({
      contracts,
      pkpId: pkpId_ ?? pkpId,
      user: user_ ?? user,
    });

  const revokeAction = (pkpId: string, action: string) =>
    mutate({
      contracts,
      pkpId: pkpId_ ?? pkpId,
      action: action_ ?? action,
    });

  const revokeActionAsync = async (pkpId: string, action: string) =>
    await mutateAsync({
      contracts,
      pkpId: pkpId_ ?? pkpId,
      action: action_ ?? action,
    });

  return {
    revokeUser,
    revokeUserAsync,
    revokeAction,
    revokeActionAsync,
    ...mutation,
  };
};
