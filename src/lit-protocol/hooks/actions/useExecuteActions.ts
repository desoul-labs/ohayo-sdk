import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  ExecuteJsProps,
  ExecuteJsResponse,
  SessionSigsMap,
} from '@lit-protocol/types';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { useLitContext } from '../useLitContext';

export type UseExecuteActionsArgs = Partial<{
  ipfsCid: string;
  code: string;
  params: Record<string, any>;
  opts: Omit<ExecuteJsProps, 'jsParams' | 'code' | 'ipfsId'>;
}>;

export type ExecuteActionsResult = ExecuteJsResponse;

export type UseExecuteActionsConfig = UseMutationOptions<
  ExecuteActionsResult,
  Error,
  UseExecuteActionsArgs
>;

type MutationArgs = UseExecuteActionsArgs & {
  client: LitNodeClient;
  sessionSigs: SessionSigsMap;
};

const mutationKey = (args: MutationArgs) =>
  ['lit', 'execute-actions', args] as const;

const mutationFn: MutationFunction<
  ExecuteActionsResult,
  MutationArgs
> = async ({ client, sessionSigs, ipfsCid, code, params, opts }) => {
  const result = await client.executeJs({
    ipfsId: ipfsCid,
    code,
    jsParams: params,
    sessionSigs,
    ...opts,
  });

  return { ...result };
};

export const useExecuteActions = ({
  ipfsCid,
  code,
  params,
  opts,
  ...config
}: UseExecuteActionsArgs & UseExecuteActionsConfig = {}) => {
  const { client, sessionSigs } = useLitContext();
  if (!sessionSigs) {
    throw new Error('Session Sigs not initialized');
  }

  const mutKey = mutationKey({
    client,
    sessionSigs,
    ipfsCid,
    code,
    params,
    opts,
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const executeIpfs = (args: Omit<UseExecuteActionsArgs, 'code'> = {}) =>
    mutate({
      client,
      sessionSigs,
      ipfsCid: ipfsCid ?? args.ipfsCid,
      params: params ?? args.params,
    });

  const executeIpfsAsync = (args: Omit<UseExecuteActionsArgs, 'code'> = {}) =>
    mutateAsync({
      client,
      sessionSigs,
      ipfsCid: ipfsCid ?? args.ipfsCid,
      params: params ?? args.params,
    });

  const executeCode = (args: Omit<UseExecuteActionsArgs, 'ipfsCid'> = {}) =>
    mutate({
      client,
      sessionSigs,
      code: code ?? args.code,
      params: params ?? args.params,
    });

  const executeCodeAsync = (
    args: Omit<UseExecuteActionsArgs, 'ipfsCid'> = {},
  ) =>
    mutateAsync({
      client,
      sessionSigs,
      code: code ?? args.code,
      params: params ?? args.params,
    });

  return {
    executeIpfs,
    executeIpfsAsync,
    executeCode,
    executeCodeAsync,
    ...mutation,
  };
};
