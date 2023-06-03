import { CreateOpts, LoadOpts, UpdateOpts } from '@ceramicnetwork/common';
import { TileDocument, TileMetadataArgs } from '@ceramicnetwork/stream-tile';
import { CommitID } from '@ceramicnetwork/streamid';
import { useCallback, useContext, useEffect, useState } from 'react';
import { CeramicContext } from '../../contexts/CeramicContext';

export type UseDeterministicDocumentOptions = {
  controllers?: string[];
  schema?: CommitID | string;
  family?: string;
  tags?: string[];
};

export const useDeterministicDocument = <T>({
  controllers = [],
  schema,
  family,
  tags,
}: UseDeterministicDocumentOptions) => {
  const { client } = useContext(CeramicContext);

  const [document, setDocument] = useState<TileDocument<T | null>>();

  useEffect(() => {
    const getDocument = async () => {
      if (!client || !client.did) {
        return;
      }

      try {
        const doc = await TileDocument.deterministic<T>(client, {
          controllers: [client.did.id, ...controllers],
          schema,
          family,
          tags,
        });
        setDocument(doc);
      } catch (e) {
        console.log(e);
        setDocument(undefined);
      }
    };

    getDocument();
  }, [client, controllers, family, schema, tags]);

  return document;
};

export type UseDocumentOptions = {
  id: string;
  opts?: LoadOpts;
};

export const useDocument = <T>({ id, opts }: UseDocumentOptions) => {
  const { client } = useContext(CeramicContext);

  const [document, setDocument] = useState<TileDocument<T | null>>();

  useEffect(() => {
    const getDocument = async () => {
      if (!client) {
        return;
      }

      try {
        const doc = await TileDocument.load<T>(client, id, opts);
        setDocument(doc);
      } catch (e) {
        console.log(e);
        setDocument(undefined);
      }
    };

    getDocument();
  }, [client, id, opts]);

  return document;
};

export type CreateDocumentArgs<T> = {
  content: T | null;
  metadata?: TileMetadataArgs;
  opts?: CreateOpts;
};

export const useCreateDocument = <T>() => {
  const { client } = useContext(CeramicContext);

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [document, setDocument] = useState<TileDocument<T | null>>();

  const create = useCallback(
    async ({ content, metadata, opts }: CreateDocumentArgs<T>) => {
      setIsPending(true);

      if (!client) {
        setError(new Error('Client is not initialized'));
        setIsError(true);
        setIsPending(false);
        return;
      }

      try {
        const doc = await TileDocument.create<T | null>(
          client,
          content,
          metadata,
          opts,
        );
        setDocument(doc);

        setIsSuccess(true);
        return doc;
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
        setIsError(true);
      } finally {
        setIsPending(false);
      }

      return;
    },
    [client],
  );

  return {
    create,
    document,
    error,
    isPending: isPending,
    isSuccess,
    isError,
  };
};

export type UpdateDocumentArgs<T> = {
  modifyContent?: (content: T | null) => T | null;
  modifyMetadata?: (metadata: TileMetadataArgs) => TileMetadataArgs;
  opts?: UpdateOpts;
};

export const useUpdateDocument = <T>(document: TileDocument<T | null>) => {
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const update = useCallback(
    async ({ opts, modifyContent, modifyMetadata }: UpdateDocumentArgs<T>) => {
      setIsPending(true);

      try {
        if (modifyContent) {
          const content = modifyContent(document.content);
          await document.update(content, undefined, opts);
        } else if (modifyMetadata) {
          const metadata = modifyMetadata(document.metadata);
          await document.update(undefined, metadata, opts);
        } else {
          await document.update(undefined, undefined, opts);
        }

        setIsSuccess(true);
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
        setIsError(true);
      } finally {
        setIsPending(false);
      }
    },
    [document],
  );

  return {
    update,
    error,
    isPending,
    isSuccess,
    isError,
  };
};
