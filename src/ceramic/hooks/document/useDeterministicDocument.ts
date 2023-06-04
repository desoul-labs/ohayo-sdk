import { CreateOpts } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument, TileMetadataArgs } from '@ceramicnetwork/stream-tile';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { DocumentContent } from 'src/ceramic/types/shared';
import { useCeramicContext } from '../useCeramicContext';

export type UseDeterministicDocumentArgs = Omit<
  TileMetadataArgs,
  'deterministic'
> & { opts?: CreateOpts };

export type DeterministicDocumentResult = {
  document: TileDocument<DocumentContent>;
};

export type UseDeterministicDocumentConfig = UseMutationOptions<
  DeterministicDocumentResult,
  Error,
  UseDeterministicDocumentArgs
>;

type MutationArgs = UseDeterministicDocumentArgs & {
  client: CeramicClient;
};

const mutationKey = (args: MutationArgs) =>
  ['ceramic', 'deterministic-document', args] as const;

const mutationFn: MutationFunction<
  DeterministicDocumentResult,
  MutationArgs
> = async ({ client, opts, ...metadata }) => {
  return {
    document: await TileDocument.deterministic<DocumentContent>(
      client,
      metadata,
      opts,
    ),
  };
};

export const useDeterministicDocument = ({
  family,
  tags,
  schema,
  forbidControllerChange,
  opts,
  ...config
}: UseDeterministicDocumentArgs & UseDeterministicDocumentConfig = {}) => {
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

  const createOrLoad = (
    metadata?: Omit<TileMetadataArgs, 'deterministic'>,
    options?: CreateOpts,
  ) =>
    mutate({
      client,
      opts: opts ?? options,
      family,
      tags,
      schema,
      forbidControllerChange,
      ...metadata,
    });

  const createOrLoadAsync = async (
    metadata?: Omit<TileMetadataArgs, 'deterministic'>,
    options?: CreateOpts,
  ) =>
    await mutateAsync({
      client,
      opts: opts ?? options,
      family,
      tags,
      schema,
      forbidControllerChange,
      ...metadata,
    });

  return {
    createOrLoad,
    createOrLoadAsync,
    ...mutation,
  };
};
