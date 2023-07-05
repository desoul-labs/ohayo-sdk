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

export type UseDeterministicDocumentArgs = Partial<{
  metadata: Omit<TileMetadataArgs, 'deterministic'>;
  opts: CreateOpts;
}>;

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
> = async ({ client, opts, metadata }) => {
  return {
    document: await TileDocument.deterministic<DocumentContent>(
      client,
      metadata ?? {},
      opts,
    ),
  };
};

export const useDeterministicDocument = ({
  metadata,
  opts,
  ...config
}: UseDeterministicDocumentArgs & UseDeterministicDocumentConfig = {}) => {
  const { client } = useCeramicContext();

  const mutKey = mutationKey({
    client,
    metadata,
    opts,
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const createOrLoad = (args: UseDeterministicDocumentArgs = {}) =>
    mutate({
      client,
      metadata: metadata ?? args.metadata,
      opts: opts ?? args.opts,
    });

  const createOrLoadAsync = async (args: UseDeterministicDocumentArgs = {}) =>
    await mutateAsync({
      client,
      metadata: metadata ?? args.metadata,
      opts: opts ?? args.opts,
    });

  return {
    createOrLoad,
    createOrLoadAsync,
    ...mutation,
  };
};
