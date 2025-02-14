import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api';
import { SubstrateConnectorConfig } from '../../types/connect';

let api: ApiPromise | null = null;

export async function connect(config: SubstrateConnectorConfig): Promise<boolean> {
  try {
    const provider = config.isWeb Socket ?? true
      ? new WsProvider(config.url)
      : new HttpProvider(config.url);

    api = await ApiPromise.create({ provider });
    console.log(`Successfully connected to ${config.url}`);
    return true;
  } catch (error) {
    console.error(`Failed to connect to ${config.url}:`, error);
    return false;
  }
}

export async function getBlockNumber(): Promise<number | null> {
  if (api) {
    try {
      const header = await api.rpc.chain.getHeader();
      const blockNumber = header.number.toNumber();
      console.log(`Latest block number: ${blockNumber}`);
      return blockNumber;
    } catch (error) {
      console.error('Failed to get block number:', error);
    }
  } else {
    console.log('No active connection.');
  }
  return null;
}

export async function disconnect(): Promise<void> {
  if (api) {
    await api.disconnect();
    console.log('Disconnected');
    api = null;
  } else {
    console.log('No active connection.');
  }
}
