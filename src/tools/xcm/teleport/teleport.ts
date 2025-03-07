import { SS58String, Binary, AccountId, Enum } from "polkadot-api"
import {
  XcmV3Junctions,
  XcmV3MultiassetAssetId,
  XcmV3MultiassetFungibility,
  XcmV3WeightLimit,
  XcmV3Junction,
} from "@polkadot-api/descriptors"
import { ApiPromise } from "../../substrace/substraceConnector"
const encodeAccount = AccountId().enc

const getBeneficiary = (address: SS58String) =>
  Enum("V3", {
    parents: 0,
    interior: XcmV3Junctions.X1(
      XcmV3Junction.AccountId32({
        network: undefined,
        id: Binary.fromBytes(encodeAccount(address)),
      }),
    ),
  })

const getNativeAsset = (amount: bigint, parents: 1 | 0) =>
  Enum("V3", [
    {
      id: XcmV3MultiassetAssetId.Concrete({
        parents,
        interior: XcmV3Junctions.Here(),
      }),
      fun: XcmV3MultiassetFungibility.Fungible(amount),
    },
  ])

export const teleportToParaChain = (relayChainApi: ApiPromise, address: SS58String, amount: bigint, paraId: number) =>
  relayChainApi.tx.XcmPallet.limited_teleport_assets({
    dest: Enum("V3", {
      parents: 0,
      interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(paraId)),
    }),
    beneficiary: getBeneficiary(address),
    assets: getNativeAsset(amount, 0),
    fee_asset_item: 0,
    weight_limit: XcmV3WeightLimit.Unlimited(),
  }
)

export const teleportToRelayChain = (paraChainApi: ApiPromise, address: SS58String, amount: bigint) =>
  paraChainApi.tx.XcmPallet.limited_teleport_assets({
    dest: Enum("V3", {
      parents: 1,
      interior: XcmV3Junctions.Here(),
    }),
    beneficiary: getBeneficiary(address),
    assets: getNativeAsset(amount, 1),
    fee_asset_item: 0,
    weight_limit: XcmV3WeightLimit.Unlimited(),
  }
)