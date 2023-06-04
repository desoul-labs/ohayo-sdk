import { LoadOpts } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument } from '@ceramicnetwork/stream-tile';
import { CommitID, StreamID } from '@ceramicnetwork/streamid';
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { useCeramicContext } from '../useCeramicContext';

export type UseDocumentArgs = {
  streamId: string | StreamID | CommitID;
  opts?: LoadOpts;
};

export type DocumentResult = {
  document: TileDocument<Record<string, any> | null>;
};

export type UseDocumentConfig = UseQueryOptions<
  DocumentResult,
  Error,
  DocumentResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseDocumentArgs & {
  client: CeramicClient;
};

const queryKey = (args: QueryArgs) => ['ceramic', 'document', args] as const;

const queryFn: QueryFunction<
  DocumentResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { client, streamId, opts }] }) => {
  return {
    document: await TileDocument.load<Record<string, any> | null>(
      client,
      streamId,
      opts,
    ),
  };
};

export const useLoadDocument = ({
  streamId,
  opts,
  ...config
}: UseDocumentArgs & UseDocumentConfig) => {
  const { client } = useCeramicContext();

  const qryKey = queryKey({ client, streamId, opts });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
