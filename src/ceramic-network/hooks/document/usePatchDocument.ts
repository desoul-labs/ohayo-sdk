import { UpdateOpts } from '@ceramicnetwork/common';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument } from '@ceramicnetwork/stream-tile';
import {
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { Operation } from 'fast-json-patch';
import { useCeramicContext } from '../useCeramicContext';

export type UsePatchDocumentArgs = Partial<{
  streamId: string;
  operations: Operation[];
  opts: UpdateOpts;
}>;

export type UsePatchDocumentConfig = UseMutationOptions<
  void,
  Error,
  UsePatchDocumentArgs
>;

type MutationArgs = UsePatchDocumentArgs & {
  client: CeramicClient;
};

const mutationKey = (args: MutationArgs) =>
  ['ceramic', 'patch-document', args] as const;

const mutationFn: MutationFunction<void, MutationArgs> = async ({
  client,
  streamId,
  operations,
  opts,
}) => {
  if (!streamId) {
    throw new Error('Missing streamId');
  }
  if (!operations) {
    throw new Error('Missing operations');
  }

  const document = await TileDocument.load(client, streamId);
  await document.patch(operations, opts);
};

export const usePatchDocument = ({
  streamId,
  operations,
  opts,
  ...config
}: UsePatchDocumentArgs & UsePatchDocumentConfig = {}) => {
  const { client } = useCeramicContext();

  const mutKey = mutationKey({
    client,
    streamId,
    operations,
    opts,
  });
  const { mutate, mutateAsync, ...mutation } = useMutation(
    mutKey,
    mutationFn,
    config,
  );

  const patch = (args: UsePatchDocumentArgs = {}) =>
    mutate({
      client,
      streamId: streamId ?? args.streamId,
      operations: operations ?? args.operations,
      opts: opts ?? args.opts,
    });

  const patchAsync = async (args: UsePatchDocumentArgs = {}) =>
    await mutateAsync({
      client,
      streamId: streamId ?? args.streamId,
      operations: operations ?? args.operations,
      opts: opts ?? args.opts,
    });

  return {
    patch,
    patchAsync,
    ...mutation,
  };
};
