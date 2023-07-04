import { LoadOpts } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link';
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { useCeramicContext } from '../useCeramicContext';

export type UseLoadCAIP10LinkArgs = {
  address: `0x${string}`;
  chainId: `eip155:${number}`;
  opts?: LoadOpts;
};

export type LoadCAIP10LinkResult = {
  link: Caip10Link;
};

export type UseLoadCAIP10LinkConfig = UseQueryOptions<
  LoadCAIP10LinkResult,
  Error,
  LoadCAIP10LinkResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseLoadCAIP10LinkArgs & {
  client: CeramicClient;
};

const queryKey = (args: QueryArgs) => ['ceramic', 'document', args] as const;

const queryFn: QueryFunction<
  LoadCAIP10LinkResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { client, address, chainId, opts }] }) => {
  return {
    link: await Caip10Link.fromAccount(client, `${chainId}:${address}`, opts),
  };
};

export const useLoadCAIP10Link = ({
  address,
  chainId,
  opts,
  ...config
}: UseLoadCAIP10LinkArgs & UseLoadCAIP10LinkConfig) => {
  const { client } = useCeramicContext();

  const qryKey = queryKey({ client, address, chainId, opts });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
