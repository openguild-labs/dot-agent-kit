export interface ISubstrateConnector {
  connect(): Promise<boolean>;
  getBlockNumber(): Promise<number | null>;
  disconnect(): Promise<void>;
}

export type SubstrateConnectorConfig = {
  name: string;
  url: string;
  isWebSocket?: boolean;
};

