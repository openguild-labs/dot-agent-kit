import { Api, KnowChainId } from "@dot-agent-kit/common"
import { MultiAddress } from "@polkadot-api/descriptors"

export const transferNativeCall = async (
  api: Api<KnowChainId>,
  to: MultiAddress,
  amount: bigint
) => {
  const data = {
    dest: to,
    value: amount
  }
  return api.tx.Balances.transfer_keep_alive(data).decodedCall
}
