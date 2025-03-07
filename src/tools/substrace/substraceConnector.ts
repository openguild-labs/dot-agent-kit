import { SubstrateConnectorConfig } from '../../types/connect';
import { createClient, TypedApi } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/node";
import { typedApi } from '../../chain/chainRegistry';

let client: ReturnType<typeof createClient> | null = null;
let provider: ReturnType<typeof getWsProvider> | null = null;

export type Chain = keyof typeof typedApi;

export async function magicApi(config: SubstrateConnectorConfig, chain: Chain): Promise<{ api: TypedApi<typeof typedApi[Chain]>; disconnect: () => void }> {
	provider = getWsProvider(config.url);
	client = createClient(provider);
	return { api: client.getTypedApi(typedApi[chain]), disconnect: client.destroy }; 
}

export type FullApi = Awaited<ReturnType<typeof magicApi>>;
export type ApiPromise = FullApi['api'];

export async function connect(config: SubstrateConnectorConfig): Promise<boolean> {
	try {
		provider = getWsProvider(config.url);
		client = createClient(provider);
		
		const block = await client.getFinalizedBlock();
		console.log(`Successfully connected to ${config.url}, block: #${block.number}`);
		
		return true;
	} catch (error) {
		console.error(`Unable to connect to ${config.url}:`, error);
		return false;
	}
}

export async function getBlockNumber(): Promise<number | null> {
	if (!client) {
		console.log('No connection.');
		return null;
	}
	
	try {
		const block = await client.getFinalizedBlock();
		console.log(`Latest block number: ${block.number}`);
		return Number(block.number);
	} catch (error) {
		console.error('Unable to get block number:', error);
		return null;
	}
}

export async function disconnect(): Promise<void> {
	if (provider) {
		try {
			// Close connection
			client = null;
			provider = null;
			console.log('Disconnected');
		} catch (error) {
			console.error('Error disconnecting:', error);
		}
	} else {
		console.log('No connection.');
	}
}
