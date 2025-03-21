import { PolkadotAgentKit } from '../agent/index';

export class PolkadotTools {
  private agent: PolkadotAgentKit;

  constructor(agent: PolkadotAgentKit) {
    this.agent = agent;
  }

  /**
   * Check the WND balance of the agent's account on a specific chain
   * @param chainName Name of the chain (e.g., 'westend')
   * @returns Balance in WND
   */
  async checkBalance(chainName: string): Promise<number> {
    console.log(`checkBalance called for chain: ${chainName}`);
    const { api } = this.agent.getConnection(chainName);
    const accountInfo = await api.query.System.Account.getValue(this.agent.address);

    const planckBalance = BigInt(accountInfo.data.free.toString());
    const wndBalance = Number(planckBalance) / Math.pow(10, 12); 

    console.log(`Balance on ${chainName}: ${wndBalance.toFixed(4)}`);
    return wndBalance;
  }

  async checkProxies(chainName: string): Promise<any[]> {
        console.log(`checkProxies called for chain: ${chainName}`);
        try {
            const { api } = this.agent.getConnection(chainName);
            
            if (!api.query.Proxy || !api.query.Proxy.Proxies) {
                console.log(`Proxy pallet not available on chain ${chainName}`);
                return [{ error: `Proxy pallet not available on chain ${chainName}` }];
            }
            
            const proxiesInfo = await api.query.Proxy.Proxies.getValue(this.agent.address);
            const [proxies] = proxiesInfo;

            if (!proxies || proxies.length === 0) {
                console.log(`No proxies found for ${this.agent.address} on ${chainName}`);
                return [];
            }
            console.log(`Found ${proxies.length} proxies for ${this.agent.address} on ${chainName}`);
            return proxies;
        } catch (error) {
            console.error(`Error checking proxies on ${chainName}:`, error);
            return [{ error: `Failed to check proxies: ${error instanceof Error ? error.message : String(error)}` }];
        }
    }
}