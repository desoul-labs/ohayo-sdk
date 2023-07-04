import { Networks } from '@ceramicnetwork/common';

export type NetworkConfig = {
  name: string;
  network: Networks;
  url: string;
  type: 'public' | 'private';
  readonly: boolean;
  pubSubTopic?: string;
  timestampAuthority?: string;
  explorerUrl?: string;
};

export const mainnet: NetworkConfig = {
  name: 'Mainnet',
  network: Networks.MAINNET,
  url: 'https://gateway.ceramic.network',
  pubSubTopic: '/ceramic/mainnet',
  timestampAuthority: 'eip155:1',
  type: 'public',
  readonly: true,
  explorerUrl: 'https://cerscan.com/',
};

export const testnetClay: NetworkConfig = {
  name: 'Clay Testnet',
  network: Networks.TESTNET_CLAY,
  url: 'https://ceramic-clay.3boxlabs.com',
  pubSubTopic: '/ceramic/testnet-clay',
  timestampAuthority: 'eip155:100',
  type: 'public',
  readonly: false,
  explorerUrl: 'https://cerscan.com/',
};

export const devUnstable: NetworkConfig = {
  name: 'Dev Unstable',
  network: Networks.DEV_UNSTABLE,
  url: 'https://ceramic-private-dev.3boxlabs.com',
  pubSubTopic: '/ceramic/dev-unstable',
  timestampAuthority: 'eip155:5',
  type: 'public',
  readonly: false,
};
