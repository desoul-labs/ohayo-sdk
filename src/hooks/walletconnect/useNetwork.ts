import { Network } from '@ethersproject/networks';
import { useEffect, useState } from 'react';
import { useProvider } from './useProvider';

export const useNetwork = () => {
  const provider = useProvider();

  const [network, setNetwork] = useState<Network>();

  useEffect(() => {
    const getNetwork = async () => {
      if (!provider) {
        return;
      }

      try {
        setNetwork(await provider.getNetwork());
      } catch (e) {
        console.log(e);
        setNetwork(undefined);
      }
    };

    getNetwork();
  }, [provider]);

  return network;
};

export const useBlockNumber = () => {
  const provider = useProvider();

  const [blockNumber, setBlockNumber] = useState<number>();

  useEffect(() => {
    const getBlockNumber = async () => {
      if (!provider) {
        return;
      }

      try {
        setBlockNumber(await provider.getBlockNumber());
      } catch (e) {
        console.log(e);
        setBlockNumber(undefined);
      }
    };

    getBlockNumber();
  }, [provider]);

  return blockNumber;
};
