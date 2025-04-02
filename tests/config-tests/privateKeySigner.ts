import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
import {
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers"
import { getPolkadotSigner } from "polkadot-api/signer"

/**
 * Create signer from mnemonic
 * @param mnemonic Mnemonic of the wallet
 * @param path Path of the wallet, default is ""
 * @returns Signer object and address
 */
export function createSignerFromMnemonic(mnemonic: string, path: string = "") {
  const entropy = mnemonicToEntropy(mnemonic)
  const miniSecret = entropyToMiniSecret(entropy)
  const derive = sr25519CreateDerive(miniSecret)
  const hdkdKeyPair = derive(path)
  
  const polkadotSigner = getPolkadotSigner(
    hdkdKeyPair.publicKey,
    "Sr25519",
    hdkdKeyPair.sign,
  )
  
  return {
    signer: polkadotSigner,
    publicKey: hdkdKeyPair.publicKey,
  }
}