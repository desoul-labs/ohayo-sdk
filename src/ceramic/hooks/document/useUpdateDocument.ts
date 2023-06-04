import { UpdateOpts } from '@ceramicnetwork/common';
import { TileDocument, TileMetadataArgs } from '@ceramicnetwork/stream-tile';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { U } from 'ts-toolbelt';

export type UseUpdateDocumentArgs = {
  document: TileDocument<U.Nullable<Record<string, any>>>;
} & Partial<{
  setContent: (
    content: U.Nullable<Record<string, any>>,
  ) => U.Nullable<Record<string, any>>;
  setMetadata: (metadata: TileMetadataArgs) => TileMetadataArgs | undefined;
  opts: UpdateOpts;
}>;

export type UseUpdateDocumentConfig = UseMutationOptions<
  void,
  Error,
  UseUpdateDocumentArgs
>;

type MutationArgs = UseUpdateDocumentArgs;

const mutationKey = (args: MutationArgs) =>
  ['ceramic', 'update-document', args] as const;

const mutationFn: MutationFunction<void, MutationArgs> = async ({
  document,
  setContent,
  setMetadata,
  opts,
}) => {
  const content = setContent?.(document.content);
  const metadata = setMetadata?.(document.metadata);
  await document.update(content, metadata, opts);
};

export const useUpdateDocument = ({
  document,
  setContent,
  setMetadata,
  opts,
  ...config
}: UseUpdateDocumentArgs & UseUpdateDocumentConfig) => {
  const mutKey = mutationKey({
    document,
    setContent,
    setMetadata,
    opts,
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const update = (
    setContent_: (
      content: U.Nullable<Record<string, any>>,
    ) => U.Nullable<Record<string, any>>,
    setMetadata_: (metadata: TileMetadataArgs) => TileMetadataArgs | undefined,
    options?: UpdateOpts,
  ) =>
    mutate({
      document,
      setContent: setContent ?? setContent_,
      setMetadata: setMetadata ?? setMetadata_,
      opts: opts ?? options,
    });

  const updateAsync = async (
    setContent_: (
      content: U.Nullable<Record<string, any>>,
    ) => U.Nullable<Record<string, any>>,
    setMetadata_: (metadata: TileMetadataArgs) => TileMetadataArgs | undefined,
    options?: UpdateOpts,
  ) =>
    await mutateAsync({
      document,
      setContent: setContent ?? setContent_,
      setMetadata: setMetadata ?? setMetadata_,
      opts: opts ?? options,
    });

  return {
    update,
    updateAsync,
    ...mutation,
  };
};
