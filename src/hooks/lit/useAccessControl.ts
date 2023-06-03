import * as lit from '@lit-protocol/lit-node-client';
import {
  AccessControlConditions,
  EvmContractConditions,
  JsonSigningResourceId,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';
import { useCallback, useContext, useState } from 'react';
import { LitContext } from 'src/contexts/LitContext';

export type UseAccessControlOptions = {
  chain: string;
} & Partial<{
  accessControlConditions: AccessControlConditions;
  evmContractConditions: EvmContractConditions;
  solRpcConditions: SolRpcConditions;
  unifiedAccessControlConditions: UnifiedAccessControlConditions;
  resourceId: JsonSigningResourceId;
}>;

export const useGatedString = (options: UseAccessControlOptions) => {
  const { client, sessionSigs } = useContext(LitContext);

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [encryptedString, setEncryptedString] = useState<Blob>();
  const [encryptedSymmetricKey, setEncryptedSymmetricKey] =
    useState<Uint8Array>();
  const [decryptedString, setDecryptedString] = useState<string>();

  const encrypt = useCallback(
    async (str: string) => {
      if (!client) {
        setError(new Error('Client is not initialized'));
        setIsError(true);
        setIsPending(false);
        return;
      }

      setIsPending(true);
      try {
        const res = await lit.encryptString(str);

        const encryptedKey = await client.saveEncryptionKey({
          ...options,
          symmetricKey: res.symmetricKey,
          sessionSigs,
        });
        setEncryptedString(res.encryptedString);
        setEncryptedSymmetricKey(encryptedKey);

        setIsSuccess(true);
        return {
          encryptedString: lit.blobToBase64String(res.encryptedString),
          encryptedSymmetricKey: encryptedKey,
        };
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
        setIsError(true);
      } finally {
        setIsPending(false);
      }
    },
    [client, options, sessionSigs],
  );

  const decrypt = useCallback(
    async (encryptedStr: string, encryptedKey: Uint8Array) => {
      if (!client) {
        setError(new Error('Client is not initialized'));
        setIsError(true);
        setIsPending(false);
        return;
      }

      setIsPending(true);
      try {
        const toDecrypt = lit.uint8arrayToString(encryptedKey, 'base16');
        const symmetricKey = await client.getEncryptionKey({
          ...options,
          toDecrypt,
          sessionSigs,
        });

        const decryptedStr = await lit.decryptString(
          lit.base64StringToBlob(encryptedStr),
          symmetricKey,
        );
        setDecryptedString(decryptedStr);

        setIsSuccess(true);
        return decryptedString;
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
        setIsError(true);
      } finally {
        setIsPending(false);
      }
    },
    [client, decryptedString, options, sessionSigs],
  );

  return {
    encrypt,
    decrypt,
    encryptedString,
    encryptedSymmetricKey,
    decryptedString,
    isPending,
    isSuccess,
    isError,
    error,
  };
};

export const useGatedFile = (options: UseAccessControlOptions) => {
  const { client, sessionSigs } = useContext(LitContext);

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [encryptedFile, setEncryptedFile] = useState<Blob>();
  const [encryptedSymmetricKey, setEncryptedSymmetricKey] =
    useState<Uint8Array>();
  const [decryptedFile, setDecryptedFile] = useState<Uint8Array>();

  const encrypt = useCallback(
    async (file: File | Blob) => {
      if (!client) {
        setError(new Error('Client is not initialized'));
        setIsError(true);
        setIsPending(false);
        return;
      }

      setIsPending(true);
      try {
        const res = await lit.encryptFile({ file });
        const encryptedKey = await client.saveEncryptionKey({
          ...options,
          symmetricKey: res.symmetricKey,
          sessionSigs,
        });
        setEncryptedFile(res.encryptedFile);
        setEncryptedSymmetricKey(encryptedKey);

        setIsSuccess(true);
        return {
          encryptedFile: lit.blobToBase64String(res.encryptedFile),
          encryptedSymmetricKey: encryptedKey,
        };
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
        setIsError(true);
      } finally {
        setIsPending(false);
      }
    },
    [client, options, sessionSigs],
  );

  const decrypt = useCallback(
    async (encryptedFile: string, encryptedKey: Uint8Array) => {
      if (!client) {
        setError(new Error('Client is not initialized'));
        setIsError(true);
        setIsPending(false);
        return;
      }

      setIsPending(true);
      try {
        const toDecrypt = lit.uint8arrayToString(encryptedKey, 'base16');
        const symmetricKey = await client.getEncryptionKey({
          ...options,
          toDecrypt,
          sessionSigs,
        });
        const decryptedFile = await lit.decryptFile({
          file: lit.base64StringToBlob(encryptedFile),
          symmetricKey,
        });
        setDecryptedFile(decryptedFile);

        setIsSuccess(true);
        return decryptedFile;
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
        setIsError(true);
      } finally {
        setIsPending(false);
      }
    },
    [client, options, sessionSigs],
  );

  return {
    encrypt,
    decrypt,
    encryptedFile,
    encryptedSymmetricKey,
    decryptedFile,
    isPending,
    isSuccess,
    isError,
    error,
  };
};
