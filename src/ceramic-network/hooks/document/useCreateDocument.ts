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

export type UseCreateDocumentArgs = TileMetadataArgs &
  Partial<{
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
> = async ({ client, content, opts, ...metadata }) => {
  return {
    document: await TileDocument.create(client, content, metadata, opts),
  };
};

export const useCreateDocument = ({
  content: content_,
  family,
  tags,
  schema,
  forbidControllerChange,
  opts,
  ...config
}: UseCreateDocumentArgs & UseCreateDocumentConfig = {}) => {
  const { client } = useCeramicContext();

  const mutKey = mutationKey({
    client,
    family,
    tags,
    schema,
    forbidControllerChange,
    opts,
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const create = (
    content: DocumentContent,
    metadata?: TileMetadataArgs,
    options?: CreateOpts,
  ) =>
    mutate({
      client,
      content: content_ ?? content,
      opts: opts ?? options,
      family,
      tags,
      schema,
      forbidControllerChange,
      ...metadata,
    });

  const createAsync = async (
    content: DocumentContent,
    metadata?: TileMetadataArgs,
    options?: CreateOpts,
  ) =>
    await mutateAsync({
      client,
      content: content_ ?? content,
      opts: opts ?? options,
      family,
      tags,
      schema,
      forbidControllerChange,
      ...metadata,
    });

  return {
    create,
    createAsync,
    ...mutation,
  };
};
