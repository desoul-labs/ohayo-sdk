import { MultiQuery, Stream } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { useCeramicContext } from '../useCeramicContext';

export type UseMultiQueryArgs = {
  queries: MultiQuery[];
  timeout?: number;
};

export type MultiQueryResult = {
  streams: Record<string, Stream>;
};

export type UseMultiQueryConfig = UseQueryOptions<
  MultiQueryResult,
  Error,
  MultiQueryResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseMultiQueryArgs & {
  client: CeramicClient;
};

const queryKey = (args: QueryArgs) => ['ceramic', 'stream', args] as const;

const queryFn: QueryFunction<
  MultiQueryResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { client, queries, timeout }] }) => {
  return {
    streams: await client.multiQuery(queries, timeout),
  };
};

export const useMultiQuery = ({
  queries,
  timeout,
  ...config
}: UseMultiQueryArgs & UseMultiQueryConfig) => {
  const { client } = useCeramicContext();

  const qryKey = queryKey({ client, queries, timeout });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
