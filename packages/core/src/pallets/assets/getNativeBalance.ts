import { Api, KnowChainId } from "@polkadot-agent-kit/common"

/**
 * Retrieves the native balance of an account
 * @param api The API instance to use for the query
 * @param address The address to query the balance for
 * @returns The native balance of the specified account
 */
export const getNativeBalance = async (api: Api<KnowChainId>, address: string): Promise<bigint> => {
  const balance = await api.query.System.Account.getValue(address)
  return balance.data.free
}
