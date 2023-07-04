import { LoadOpts } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument } from '@ceramicnetwork/stream-tile';
import { CommitID, StreamID } from '@ceramicnetwork/streamid';
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { DocumentContent } from '../../types/shared';
import { useCeramicContext } from '../useCeramicContext';

export type UseLoadDocumentArgs = {
  streamId: string | StreamID | CommitID;
  opts?: LoadOpts;
};

export type LoadDocumentResult = {
  document: TileDocument<DocumentContent>;
};

export type UseLoadDocumentConfig = UseQueryOptions<
  LoadDocumentResult,
  Error,
  LoadDocumentResult,
  ReturnType<typeof queryKey>
>;

type QueryArgs = UseLoadDocumentArgs & {
  client: CeramicClient;
};

const queryKey = (args: QueryArgs) =>
  ['ceramic', 'load-document', args] as const;

const queryFn: QueryFunction<
  LoadDocumentResult,
  ReturnType<typeof queryKey>
> = async ({ queryKey: [, , { client, streamId, opts }] }) => {
  return {
    document: await TileDocument.load(client, streamId, opts),
  };
};

export const useLoadDocument = ({
  streamId,
  opts,
  ...config
}: UseLoadDocumentArgs & UseLoadDocumentConfig) => {
  const { client } = useCeramicContext();

  const qryKey = queryKey({ client, streamId, opts });
  const query = useQuery(qryKey, queryFn, config);

  return query;
};
