import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { useLitContext } from '../useLitContext';

export type UseGetPKPPermissionArgs = {
  pkpId: string;
};

export type GetPKPPermissionResult = {
  users: string[];
  actions: string[];
};

export type UseGetPKPPermissionConfig = UseQueryOptions<
  GetPKPPermissionResult,
  Error,
  GetPKPPermissionResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseGetPKPPermissionArgs & {
  contracts: LitContracts;
};

const queryKey = (args: QueryArgs) =>
  ['lit', 'get-pkp-permission', args] as const;

const queryFn: QueryFunction<
  GetPKPPermissionResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { contracts, pkpId }] }) => {
  const users =
    await contracts.pkpPermissionsContractUtil.read.getPermittedAddresses(
      pkpId,
    );
  const actions =
    await contracts.pkpPermissionsContractUtil.read.getPermittedActions(pkpId);

  return { users, actions };
};

export const useGetPKPPermission = ({
  pkpId,
  ...config
}: UseGetPKPPermissionArgs & UseGetPKPPermissionConfig) => {
  const { contracts } = useLitContext();
  if (!contracts) {
    throw new Error('Contracts not initialized');
  }

  const qryKey = queryKey({ contracts, pkpId });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
