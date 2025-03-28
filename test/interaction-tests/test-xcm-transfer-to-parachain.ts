import { addressOfSubstrate, publicKeyOf, toMultiAddress } from "../config-tests/account"
import { substrateApi } from "../../src/tools/substrace"
import { createProxy, removeProxy } from "../../src/tools/pallet-proxy"
import { teleportToParaChain, teleportToRelayChain } from "../../src/tools/xcm/teleport"

/** Westend use SS58 address 42 **/
const publicKey = publicKeyOf(process.env.PRIVATE_KEY)
const myAccount = addressOfSubstrate(publicKey)
console.log('My account:', myAccount)

const myDelegatePublicKey = publicKeyOf(process.env.DELEGATE_PRIVATE_KEY)
const myDelegateAddress = addressOfSubstrate(myDelegatePublicKey)

async function main() {
  const { api, disconnect } = await substrateApi({ url: 'wss://westend-rpc.polkadot.io', name: 'westend' }, 'westend')
  console.log('My delegate address:', myDelegateAddress)

  /** 0. convert to myAccount and my delegate multi address **/
  const myDelegateMultiAddress = toMultiAddress(myDelegateAddress)

  /** 1. setup proxy account for it to your own **/
  /** Make sure your signer account have enough funds **/
  const proxySetup = await createProxy(api, myDelegateMultiAddress)
  console.log('Proxy setup:', proxySetup)

  /** 2. Test teleportToParaChain **/
  const paraChainTeleport = await teleportToParaChain(myAccount, BigInt(1000000000000000000))
  console.log('Teleport to ParaChain:', paraChainTeleport)

  /** 4. remove proxy **/
  const removeProxyCall = await removeProxy(api, myDelegateMultiAddress)
  console.log('Proxy removed:', removeProxyCall)

  disconnect();
}

main().catch(console.error);    