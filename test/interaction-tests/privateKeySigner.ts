import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
import {
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers"
import { getPolkadotSigner } from "polkadot-api/signer"

/**
 * Tạo signer từ cụm từ mnemonic
 * @param mnemonic Cụm từ mnemonic của ví
 * @param path Đường dẫn của ví, mặc định là ""
 * @returns Đối tượng signer và địa chỉ
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