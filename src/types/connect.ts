import { ApiPromise } from '@polkadot/api';

export interface ISubstrateConnector {
  connect(): Promise<boolean>;
  getBlockNumber(): Promise<number | null>;
  disconnect(): Promise<void>;
}

export type SubstrateConnectorConfig = {
  url: string;
  isWebSocket?: boolean;
};