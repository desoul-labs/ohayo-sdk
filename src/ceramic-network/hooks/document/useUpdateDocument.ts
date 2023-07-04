import { UpdateOpts } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument, TileMetadataArgs } from '@ceramicnetwork/stream-tile';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { DocumentContent } from '../../types/shared';
import { useCeramicContext } from '../useCeramicContext';

export type UseUpdateDocumentArgs = Partial<{
  streamId: string;
  setContent: (content: DocumentContent) => DocumentContent;
  setMetadata: (metadata: TileMetadataArgs) => TileMetadataArgs | undefined;
  opts: UpdateOpts;
}>;

export type UseUpdateDocumentConfig = UseMutationOptions<
  void,
  Error,
  UseUpdateDocumentArgs
>;

type MutationArgs = UseUpdateDocumentArgs & {
  client: CeramicClient;
};

const mutationKey = (args: MutationArgs) =>
  ['ceramic', 'update-document', args] as const;

const mutationFn: MutationFunction<void, MutationArgs> = async ({
  client,
  streamId,
  setContent,
  setMetadata,
  opts,
}) => {
  if (!streamId) {
    throw new Error('Missing streamId');
  }

  const document: TileDocument<DocumentContent> = await TileDocument.load(
    client,
    streamId,
  );
  const content = setContent?.(document.content);
  const metadata = setMetadata?.(document.metadata);
  await document.update(content, metadata, opts);
};

export const useUpdateDocument = ({
  streamId: streamId_,
  setContent: setContent_,
  setMetadata: setMetadata_,
  opts,
  ...config
}: UseUpdateDocumentArgs & UseUpdateDocumentConfig) => {
  const { client } = useCeramicContext();

  const mutKey = mutationKey({
    client,
    streamId: streamId_,
    setContent: setContent_,
    setMetadata: setMetadata_,
    opts,
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const update = (
    streamId: string,
    setContent?: (content: DocumentContent) => DocumentContent,
    setMetadata?: (metadata: TileMetadataArgs) => TileMetadataArgs,
    options?: UpdateOpts,
  ) =>
    mutate({
      client,
      streamId,
      setContent: setContent_ ?? setContent,
      setMetadata: setMetadata_ ?? setMetadata,
      opts: opts ?? options,
    });

  const updateAsync = async (
    streamId: string,
    setContent?: (content: DocumentContent) => DocumentContent,
    setMetadata?: (metadata: TileMetadataArgs) => TileMetadataArgs,
    options?: UpdateOpts,
  ) =>
    await mutateAsync({
      client,
      streamId,
      setContent: setContent_ ?? setContent,
      setMetadata: setMetadata_ ?? setMetadata,
      opts: opts ?? options,
    });

  return {
    update,
    updateAsync,
    ...mutation,
  };
};
