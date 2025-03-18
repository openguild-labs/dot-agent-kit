import { SS58String, Binary, AccountId, Enum, TypedApi } from "polkadot-api"
import {
  XcmV3Junctions,
  XcmV3MultiassetAssetId,
  XcmV3MultiassetFungibility,
  XcmV3WeightLimit,
  XcmV3Junction,
  westend2,
  westend2_asset_hub,
} from "@polkadot-api/descriptors"

import { getChainApi, getParachainId } from "../../../chain"

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

export const teleportToRelayChain = async (chainName: string, address: SS58String, amount: bigint) => {
  const api = await getChainApi(chainName) as TypedApi<typeof westend2>;
  const parachainId = getParachainId(chainName);
  return api.tx.XcmPallet.limited_teleport_assets({
    dest: Enum("V3", {
      parents: 0,
      interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(parachainId)),
    }),
    beneficiary: getBeneficiary(address),
    assets: getNativeAsset(amount, 0),
    fee_asset_item: 0,
    weight_limit: XcmV3WeightLimit.Unlimited(),
  });
};

export const teleportToParaChain = async (chainName: string, address: SS58String, amount: bigint) => {
  const api = await getChainApi(chainName) as TypedApi<typeof westend2_asset_hub>;
  return api.tx.PolkadotXcm.limited_teleport_assets({
    dest: Enum("V3", {
      parents: 1,
      interior: XcmV3Junctions.Here(),
    }),
    beneficiary: getBeneficiary(address),
    assets: getNativeAsset(amount, 1),
    fee_asset_item: 0,
    weight_limit: XcmV3WeightLimit.Unlimited(),
  });
};