import { LitContracts } from '@lit-protocol/contracts-sdk';
import { PKPNFT } from '@lit-protocol/contracts-sdk/src/abis/PKPNFT';
import { PKPPermissions } from '@lit-protocol/contracts-sdk/src/abis/PKPPermissions';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ContractTransaction, Signer } from 'ethers';
import { useCallback, useContext, useEffect, useState } from 'react';
import { LitContext } from 'src/contexts/LitContext';

export const useMintPKP = () => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [pkpId, setPkpId] = useState<string>();
  const [pubKey, setPubKey] = useState<string>();

  const mint = useCallback(async (signer: Signer) => {
    setIsPending(true);
    try {
      const contracts = new LitContracts({ signer });
      await contracts.connect();

      const { tokenId: id } = await contracts.pkpNftContractUtil.write.mint();
      setPkpId(id);
      const pk = await (contracts.pkpNftContract.read as PKPNFT).getPubkey(id);
      setPubKey(pk);

      setIsSuccess(true);
      return {
        pkpId: id,
        pubKey: pk,
      };
    } catch (e) {
      if (e instanceof Error) {
        setIsError(true);
        setError(e);
      }
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mint,
    pkpId,
    pubKey,
    isPending,
    isSuccess,
    isError,
    error,
  };
};

export const usePKPTransfer = (pkpId: string) => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const transfer = useCallback(
    async (signer: Signer, to: string) => {
      setIsPending(true);
      try {
        const contracts = new LitContracts({ signer });
        await contracts.connect();

        const tx = await (
          contracts.pkpNftContract.write as PKPNFT
        ).transferFrom(await signer.getAddress(), to, pkpId);
        setTxHash(tx.hash);

        setIsSuccess(true);
      } catch (e) {
        if (e instanceof Error) {
          setIsError(true);
          setError(e);
        }
      } finally {
        setIsPending(false);
      }
    },
    [pkpId],
  );

  return {
    transfer,
    isPending,
    isSuccess,
    isError,
    error,
    txHash,
  };
};

export type PermissionOperationArgs = Partial<{
  userAddress: string;
  actionIpfsCid: string;
}>;

export const usePKPGrantPermission = (pkpId: string) => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);

  const grantPermission = useCallback(
    async (
      signer: Signer,
      { actionIpfsCid, userAddress }: PermissionOperationArgs,
    ) => {
      try {
        setIsPending(true);

        const contracts = new LitContracts({ signer });
        await contracts.connect();

        if (userAddress) {
          const tx: ContractTransaction =
            await contracts.pkpPermissionsContractUtil.write.addPermittedAddress(
              pkpId,
              userAddress,
            );
          await tx.wait();
        }
        if (actionIpfsCid) {
          const tx: ContractTransaction =
            await contracts.pkpPermissionsContractUtil.write.addPermittedAction(
              pkpId,
              actionIpfsCid,
            );
          await tx.wait();
        }

        setIsSuccess(true);
      } catch (e) {
        if (e instanceof Error) {
          setIsError(true);
          setError(e);
        }
      } finally {
        setIsPending(false);
      }
    },
    [pkpId],
  );

  return {
    grantPermission,
    isPending,
    isSuccess,
    isError,
    error,
  };
};

export const usePKPRevokePermission = (pkpId: string) => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState<Error | null>(null);

  const revokePermission = useCallback(
    async (
      signer: Signer,
      { userAddress, actionIpfsCid }: PermissionOperationArgs,
    ) => {
      try {
        setIsPending(true);

        const contracts = new LitContracts({ signer });
        await contracts.connect();

        if (userAddress) {
          const tx: ContractTransaction = await (
            contracts.pkpPermissionsContract.write as PKPPermissions
          ).removePermittedAddress(pkpId, userAddress);
          await tx.wait();
        }
        if (actionIpfsCid) {
          const tx: ContractTransaction =
            await contracts.pkpPermissionsContractUtil.write.revokePermittedAction(
              pkpId,
              actionIpfsCid,
            );
          await tx.wait();
        }

        setIsSuccess(true);
      } catch (e) {
        if (e instanceof Error) {
          setIsError(true);
          setError(e);
        }
      } finally {
        setIsPending(false);
      }
    },
    [pkpId],
  );

  return {
    revokePermission,
    isPending,
    isSuccess,
    isError,
    error,
  };
};

export const usePKPGetPermissions = (pkpId: string) => {
  const [addresses, setAddresses] = useState<string[]>();
  const [actions, setActions] = useState<string[]>();

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const contracts = new LitContracts();
        await contracts.connect();

        const addrs =
          await contracts.pkpPermissionsContractUtil.read.getPermittedAddresses(
            pkpId,
          );
        setAddresses(addrs);
        const acts =
          await contracts.pkpPermissionsContractUtil.read.getPermittedActions(
            pkpId,
          );
        setActions(acts);
      } catch (e) {
        console.log(e);
        setAddresses(undefined);
        setActions(undefined);
      }
    };

    getPermissions();
  }, [pkpId]);

  return {
    permittedAddresses: addresses,
    permittedActions: actions,
  };
};

export const usePKPWallet = (pkpPubKey: string) => {
  const { sessionSigs } = useContext(LitContext);
  const [wallet, setWallet] = useState<PKPEthersWallet>();

  useEffect(() => {
    const createWallet = async () => {
      try {
        if (!sessionSigs) {
          return;
        }

        const pkpWallet = new PKPEthersWallet({
          pkpPubKey,
          controllerSessionSigs: sessionSigs,
        });
        await pkpWallet.init();
        setWallet(pkpWallet);
      } catch (e) {
        console.log(e);
        setWallet(undefined);
      }
    };

    createWallet();
  }, [pkpPubKey, sessionSigs]);

  return wallet;
};
