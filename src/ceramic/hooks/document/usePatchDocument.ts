import { UpdateOpts } from '@ceramicnetwork/common';
import { TileDocument } from '@ceramicnetwork/stream-tile';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { Operation } from 'fast-json-patch';
import { DocumentContent } from 'src/ceramic/types/shared';

export type UsePatchDocumentArgs = {
  document: TileDocument<DocumentContent>;
} & Partial<{
  operations: Operation[];
  opts: UpdateOpts;
}>;

export type UsePatchDocumentConfig = UseMutationOptions<
  void,
  Error,
  UsePatchDocumentArgs
>;

type MutationArgs = UsePatchDocumentArgs;

const mutationKey = (args: MutationArgs) =>
  ['ceramic', 'patch-document', args] as const;

const mutationFn: MutationFunction<void, MutationArgs> = async ({
  document,
  operations,
  opts,
}) => await document.patch(operations ?? [], opts);

export const usePatchDocument = ({
  document,
  operations,
  opts,
  ...config
}: UsePatchDocumentArgs & UsePatchDocumentConfig) => {
  const mutKey = mutationKey({
    document,
    operations,
    opts,
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const patch = (operations_: Operation[], options?: UpdateOpts) =>
    mutate({
      document,
      operations: operations ?? operations_,
      opts: opts ?? options,
    });

  const patchAsync = async (operations_: Operation[], options?: UpdateOpts) =>
    await mutateAsync({
      document,
      operations: operations ?? operations_,
      opts: opts ?? options,
    });

  return {
    patch,
    patchAsync,
    ...mutation,
  };
};
