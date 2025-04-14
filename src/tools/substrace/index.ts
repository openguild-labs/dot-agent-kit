import { SubstrateConnectorConfig } from '../../types/connect';
import { createClient, TypedApi } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/node";
import { chainDescriptorRegistry } from '../../chain/chainRegistry';

// Track active connections and their state
const activeConnections = new Map<string, {
	client: ReturnType<typeof createClient>,
	reconnectCount: number,
	isReconnecting: boolean
}>();

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // 1 second initial delay

// Chain can be any string since we're using a dynamic registry
export type Chain = string;

/**
 * Attempts to reconnect to a chain endpoint
 * @param endpoint The WebSocket endpoint URL
 * @param descriptor The chain descriptor
 */
async function attemptReconnection(endpoint: string): Promise<boolean> {
	const connection = activeConnections.get(endpoint);
	if (!connection) return false;
	
	// If we've already tried too many times, give up
	if (connection.reconnectCount >= MAX_RECONNECT_ATTEMPTS) {
		console.error(`⛔ Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) exceeded for ${endpoint}`);
		return false;
	}
	
	// Mark that we're attempting reconnection
	connection.isReconnecting = true;
	
	// Calculate exponential backoff delay
	const delay = RECONNECT_DELAY * Math.pow(2, connection.reconnectCount);
	console.warn(`⚠️ Connection error for ${endpoint}, reconnecting in ${delay}ms (attempt ${connection.reconnectCount + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
	
	// Increment the reconnection counter
	connection.reconnectCount++;
	
	try {
		// Wait for the backoff delay
		await new Promise(resolve => setTimeout(resolve, delay));
		
		// Create a new client and provider
		const provider = getWsProvider(endpoint);
		const client = createClient(provider);
		
		// Test the connection
		await client.getFinalizedBlock();
		
		// Update the connection with the new client
		connection.client = client;
		connection.isReconnecting = false;
		
		
		return true;
	} catch (error) {
		console.error(`❌ Failed to reconnect to ${endpoint}:`, error);
		connection.isReconnecting = false;
		
		// Try again with increased delay
		return attemptReconnection(endpoint);
	}
}

/**
 * Creates or retrieves a client for the given endpoint
 * @param config Connection configuration
 * @returns Client with reconnection handling
 */
async function getOrCreateClient(config: SubstrateConnectorConfig): Promise<ReturnType<typeof createClient>> {
	const endpoint = config.url;
	
	// Check if we already have an active connection
	const existingConnection = activeConnections.get(endpoint);
	if (existingConnection && !existingConnection.isReconnecting) {
		return existingConnection.client;
	}
	
	// Create a new connection
	try {
		const provider = getWsProvider(endpoint);
		const client = createClient(provider);
		
		// Store the connection
		activeConnections.set(endpoint, {
			client,
			reconnectCount: 0,
			isReconnecting: false
		});
		
		return client;
	} catch (error) {
		console.error(`❌ Failed to create client for ${endpoint}:`, error);
		throw error;
	}
}

export async function substrateApi(config: SubstrateConnectorConfig, chain: Chain): Promise<{ api: any; disconnect: () => void }> {
	// Get the descriptor for this chain
	const descriptor = chainDescriptorRegistry.getDescriptor(chain);
	if (!descriptor) {
		throw new Error(`Chain descriptor not found for chain: ${chain}. Make sure to register it first.`);
	}
	
	// Get or create a client
	const client = await getOrCreateClient(config);
	
	// Create a typed API with the descriptor
	const api = client.getTypedApi(descriptor);
	
	// Create a proper disconnect function that cleans up everything
	const disconnect = () => {
		try {
			// Remove this endpoint from the active connections
			activeConnections.delete(config.url);
			
			// Destroy the client
			client.destroy();
			
			
		} catch (error) {
			console.error(`Error during disconnect from ${config.url}:`, error);
		}
	};
	
	// Set up error handling for ChainHead disjointed errors
	// Use a more generic approach since we don't know the exact API structure
	const checkConnection = async () => {
		try {
			await client.getFinalizedBlock();
		} catch (error) {
			if (error instanceof Error && 
				(error.message.includes('ChainHead disjointed') || 
				 error.message.includes('Connection closed'))) {
				console.error(`🔄 Detected chain error: ${error.message}`);
				attemptReconnection(config.url);
			}
		}
	};
	
	// Check connection periodically
	const interval = setInterval(checkConnection, 10000);
	
	// Update disconnect to also clear the interval
	const originalDisconnect = disconnect;
	const newDisconnect = () => {
		clearInterval(interval);
		originalDisconnect();
	};
	
	return { api, disconnect: newDisconnect };
}

export type FullApi = Awaited<ReturnType<typeof substrateApi>>;
export type ApiPromise = FullApi['api'];

export async function connect(config: SubstrateConnectorConfig): Promise<boolean> {
	try {
		const client = await getOrCreateClient(config);
		await client.getFinalizedBlock();
		return true;
	} catch (error) {
		return false;
	}
}

export async function getBlockNumber(): Promise<number | null> {
	return null; // This needs to be implemented with the specific client
}

export async function disconnect(): Promise<void> {
	// This is a no-op as each connection manages its own disconnect
}