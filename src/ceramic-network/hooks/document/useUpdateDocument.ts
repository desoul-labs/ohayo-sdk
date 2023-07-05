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
  streamId,
  setContent,
  setMetadata,
  opts,
  ...config
}: UseUpdateDocumentArgs & UseUpdateDocumentConfig = {}) => {
  const { client } = useCeramicContext();

  const mutKey = mutationKey({
    client,
    streamId,
    setContent,
    setMetadata,
    opts,
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const update = (args: UseUpdateDocumentArgs = {}) =>
    mutate({
      client,
      streamId: streamId ?? args.streamId,
      setContent: setContent ?? args.setContent,
      setMetadata: setMetadata ?? args.setMetadata,
      opts: opts ?? args.opts,
    });

  const updateAsync = async (args: UseUpdateDocumentArgs = {}) =>
    await mutateAsync({
      client,
      streamId: streamId ?? args.streamId,
      setContent: setContent ?? args.setContent,
      setMetadata: setMetadata ?? args.setMetadata,
      opts: opts ?? args.opts,
    });

  return {
    update,
    updateAsync,
    ...mutation,
  };
};
