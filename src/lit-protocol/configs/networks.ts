import { LIT_NETWORKS } from '@lit-protocol/constants';
import { LIT_NETWORKS_KEYS } from '@lit-protocol/types';

export type NetworkConfig = {
  name: string;
  network: LIT_NETWORKS_KEYS;
  bootstrapUrls: string[];
};

export const jalapeno: NetworkConfig = {
  name: 'Jalapeno Mainnet',
  network: 'jalapeno',
  bootstrapUrls: LIT_NETWORKS.jalapeno,
};

export const serrano: NetworkConfig = {
  name: 'Serrano Testnet',
  network: 'serrano',
  bootstrapUrls: LIT_NETWORKS.serrano,
};
