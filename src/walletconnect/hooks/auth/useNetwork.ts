import { Network } from '@ethersproject/networks';
import { useEffect, useState } from 'react';
import { useProvider } from '../provider/useProvider';

export const useNetwork = () => {
  const { data } = useProvider();
  const [network, setNetwork] = useState<Network>();

  useEffect(() => {
    const getNetwork = async () => {
      if (!data?.provider) {
        return;
      }

      try {
        setNetwork(await data?.provider.getNetwork());
      } catch (e) {
        setNetwork(undefined);
      }
    };

    getNetwork();
  }, [data?.provider]);

  return network;
};

export const useBlockNumber = () => {
  const { data } = useProvider();
  const [blockNumber, setBlockNumber] = useState<number>();

  useEffect(() => {
    const getBlockNumber = async () => {
      if (!data?.provider) {
        return;
      }

      try {
        setBlockNumber(await data?.provider.getBlockNumber());
      } catch (e) {
        setBlockNumber(undefined);
      }
    };

    getBlockNumber();
  }, [data?.provider]);

  return blockNumber;
};
