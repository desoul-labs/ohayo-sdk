import { CreateOpts } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument, TileMetadataArgs } from '@ceramicnetwork/stream-tile';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { DocumentContent } from '../../types/shared';
import { useCeramicContext } from '../useCeramicContext';

export type UseCreateDocumentArgs = Partial<{
  metadata: TileMetadataArgs;
  content: DocumentContent;
  opts: CreateOpts;
}>;

export type CreateDocumentResult = {
  document: TileDocument<DocumentContent>;
};

export type UseCreateDocumentConfig = UseMutationOptions<
  CreateDocumentResult,
  Error,
  UseCreateDocumentArgs
>;

type MutationArgs = UseCreateDocumentArgs & {
  client: CeramicClient;
};

const mutationKey = (args: MutationArgs) =>
  ['ceramic', 'create-document', args] as const;

const mutationFn: MutationFunction<
  CreateDocumentResult,
  MutationArgs
> = async ({ client, content, metadata, opts }) => {
  return {
    document: await TileDocument.create(client, content, metadata, opts),
  };
};

export const useCreateDocument = ({
  content,
  metadata,
  opts,
  ...config
}: UseCreateDocumentArgs & UseCreateDocumentConfig = {}) => {
  const { client } = useCeramicContext();

  const mutKey = mutationKey({
    client,
    content,
    metadata,
    opts,
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const create = (args: UseCreateDocumentArgs = {}) =>
    mutate({
      client,
      content: content ?? args.content,
      opts: opts ?? args.opts,
      metadata: metadata ?? args.metadata,
    });

  const createAsync = async (args: UseCreateDocumentArgs = {}) =>
    await mutateAsync({
      client,
      content: content ?? args.content,
      opts: opts ?? args.opts,
      metadata: metadata ?? args.metadata,
    });

  return {
    create,
    createAsync,
    ...mutation,
  };
};
