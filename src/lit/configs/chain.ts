import { Chain } from '@wagmi/chains';

export const chronicle: Chain = {
  id: 175177,
  name: 'Lit Chronicle Testnet',
  network: 'Chronicle - Lit Protocol Testnet',
  nativeCurrency: {
    name: 'LIT',
    symbol: 'LIT',
    decimals: 18,
  },
  rpcUrls: {
    public: { http: ['https://chain-rpc.litprotocol.com/http'] },
    default: { http: ['https://chain-rpc.litprotocol.com/http'] },
  },
  blockExplorers: {
    default: {
      name: 'Lit Protocol Explorer',
      url: 'https://chain.litprotocol.com/',
    },
  },
};
