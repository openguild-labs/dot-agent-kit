import { Chain } from '../tools/substrace';

export interface ChainInfo {
  url: string;
  name: string;
  apiKey: Chain;
  type: 'RelayChain' | 'ParaChain';
  paraId?: number;
}

export interface ChainMap {
  [key: string]: ChainInfo;
}

export const defaultChainMap: ChainMap = {
  'westend': {
    url: 'wss://westend-rpc.dwellir.com',
    name: 'westend',
    apiKey: 'westend',
    type: 'RelayChain'
  },
  'westend_asset_hub': {
    url: 'wss://westmint-rpc.dwellir.com',
    name: 'westend_asset_hub',
    apiKey: 'westend_asset_hub',
    type: 'ParaChain',
    paraId: 1000
  }
};
