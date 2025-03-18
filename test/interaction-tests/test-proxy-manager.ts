import { Binary, TxCallData, TxFinalizedPayload } from "polkadot-api"
import { addressOf, addressOfSubstrate, publicKeyOf, toMultiAddress } from "../config-tests/account"
import { Chain, magicApi } from "../../src/tools/substrace"
import { callAsProxy, createProxy, removeProxy, transferKeepAlive} from "../../src/tools/pallet-proxy"

// Westend use SS58 address 42
const publicKey = publicKeyOf(process.env.PRIVATE_KEY)
const myAccount = addressOfSubstrate(publicKey)
console.log('My signer account:', myAccount)

const myDelegatePublicKey = publicKeyOf(process.env.DELEGATE_PRIVATE_KEY)
const myDelegateAddress = addressOfSubstrate(myDelegatePublicKey)

async function main() {
  const { api, disconnect } = await magicApi({ url: 'wss://westend-rpc.polkadot.io', name: 'westend' }, 'west')
  console.log('My delegate address:', myDelegateAddress)

  // 0. convert to myAccount and my delegate multi address
  const myMultiAddress = toMultiAddress(myAccount)
  const myDelegateMultiAddress = toMultiAddress(myDelegateAddress)
  const myReceiverMultiAddress = toMultiAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')

  // 1. setup proxy account for it to your own
  // Make sure your signer account have enough funds
  const proxySetup = await createProxy(api, myDelegateMultiAddress)
  console.log('Proxy setup:', proxySetup)

  // 2. get transfer decoded call
  const transferCall = await transferKeepAlive(api, myReceiverMultiAddress, BigInt(1))
  console.log('Transfer call:', transferCall)

  // 3. call as proxy with delegate signer 
  const transferProxy = await callAsProxy(api, { address: myMultiAddress, call: transferCall })
  console.log('Transfer proxy:', transferProxy)

  // 4. remove proxy
  const removeProxyCall = await removeProxy(api, myDelegateMultiAddress)
  console.log('Proxy removed:', removeProxyCall)

  disconnect();
}

main().catch(console.error);    