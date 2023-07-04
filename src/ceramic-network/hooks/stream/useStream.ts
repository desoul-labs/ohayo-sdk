import { LoadOpts, Stream } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { CommitID, StreamID } from '@ceramicnetwork/streamid';
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { useCeramicContext } from '../useCeramicContext';

export type UseStreamArgs = {
  streamId: string | StreamID | CommitID;
  opts?: LoadOpts;
};

export type StreamResult = {
  stream: Stream;
};

export type UseStreamConfig = UseQueryOptions<
  StreamResult,
  Error,
  StreamResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseStreamArgs & {
  client: CeramicClient;
};

const queryKey = (args: QueryArgs) => ['ceramic', 'stream', args] as const;

const queryFn: QueryFunction<
  StreamResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { client, streamId, opts }] }) => {
  return {
    stream: await client.loadStream(streamId, opts),
  };
};

export const useStream = ({
  streamId,
  opts,
  ...config
}: UseStreamArgs & UseStreamConfig) => {
  const { client } = useCeramicContext();

  const qryKey = queryKey({ client, streamId, opts });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
