import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { randomUUID } from 'crypto';
import { useCallback, useContext, useState } from 'react';
import { FourEverLandContext } from 'src/4everland/contexts/4EverlandContext';

export type UploadFileOptions = {
  objectId?: string;
  payload: string | Uint8Array | Buffer;
  mimeType?: string;
};

export const useUploadFile = (bucketName: string) => {
  const { client } = useContext(FourEverLandContext);

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string>();
  const [arweaveHash, setArweaveHash] = useState<string>();

  const upload = useCallback(
    async ({ objectId, payload, mimeType }: UploadFileOptions) => {
      if (!client) {
        setError(new Error('Client is not initialized'));
        setIsError(true);
        setIsPending(false);
        return;
      }

      setIsPending(true);
      try {
        const params: PutObjectCommandInput = {
          Bucket: bucketName,
          Key: objectId ?? randomUUID(),
          Body: payload,
          ContentType: mimeType,
        };
        const task = new Upload({
          client,
          queueSize: 3,
          params,
        });
        const output = await task.done();

        if (output.$metadata.httpStatusCode !== 200) {
          throw new Error('Upload failed');
        }

        const metadata = await new Promise<Record<string, string>>(
          (resolve, reject) =>
            client.headObject(
              {
                Bucket: bucketName,
                Key: objectId,
              },
              (err, res) => {
                if (err) {
                  reject(err);
                }
                if (res?.Metadata) {
                  resolve(res.Metadata);
                } else {
                  reject(new Error('No metadata found'));
                }
              },
            ),
        );

        setIsSuccess(true);
        setIpfsCid(metadata['ipfs-hash']);
        setArweaveHash(metadata['arweave-hash']);

        return {
          ipfsCid: metadata['ipfs-hash'],
          arweaveHash: metadata['arweave-hash'],
        };
      } catch (e) {
        setIsError(true);
        if (e instanceof Error) {
          setError(e);
        }
      } finally {
        setIsPending(false);
      }
    },
    [bucketName, client],
  );

  return {
    error,
    isPending,
    isSuccess,
    isError,
    cid: ipfsCid,
    hash: arweaveHash,
    upload,
  };
};
