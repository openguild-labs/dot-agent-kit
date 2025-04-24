import { Api, KnowChainId } from "@dot-agent-kit/common"

export const getNativeBalance = async (api: Api<KnowChainId>, address: string): Promise<bigint> => {
  const balance = await api.query.System.Account.getValue(address)
  return balance.data.free
}
