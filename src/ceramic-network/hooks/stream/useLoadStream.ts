import { LoadOpts, Stream } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { CommitID, StreamID } from '@ceramicnetwork/streamid';
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { useCeramicContext } from '../useCeramicContext';

export type UseLoadStreamArgs = {
  streamId: string | StreamID | CommitID;
  opts?: LoadOpts;
};

export type LoadStreamResult = {
  stream: Stream;
};

export type UseLoadStreamConfig = UseQueryOptions<
  LoadStreamResult,
  Error,
  LoadStreamResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseLoadStreamArgs & {
  client: CeramicClient;
};

const queryKey = (args: QueryArgs) => ['ceramic', 'stream', args] as const;

const queryFn: QueryFunction<
  LoadStreamResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { client, streamId, opts }] }) => {
  return {
    stream: await client.loadStream(streamId, opts),
  };
};

export const useLoadStream = ({
  streamId,
  opts,
  ...config
}: UseLoadStreamArgs & UseLoadStreamConfig) => {
  const { client } = useCeramicContext();

  const qryKey = queryKey({ client, streamId, opts });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
