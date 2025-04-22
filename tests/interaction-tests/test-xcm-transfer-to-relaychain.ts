import {
  addressOfSubstrate,
  buildAccountDelegateProxySigner,
  buildAccountSigner,
  publicKeyOf,
  toMultiAddress,
} from "../config-tests/account";
import { substrateApi } from "../../src/tools/substrace";
import { createProxy, removeProxy } from "../../src/tools/pallet-proxy";
import {
  teleportToParaChain,
  teleportToRelayChain,
} from "../../src/tools/xcm/teleport";

/** Westend use SS58 address 42 **/
const publicKey = publicKeyOf(process.env.PRIVATE_KEY);
const myAccount = addressOfSubstrate(publicKey);
console.log("My account:", myAccount);

const myDelegatePublicKey = publicKeyOf(process.env.DELEGATE_PRIVATE_KEY);
const myDelegateAddress = addressOfSubstrate(myDelegatePublicKey);

async function main() {
  const { api, disconnect } = await substrateApi(
    { url: "wss://westmint-rpc-tn.dwellir.com", name: "westend2_asset_hub" },
    "westend_asset_hub",
  );
  console.log("My delegate address:", myDelegateAddress);

  /** 0. convert to myAccount and my delegate multi address **/
  const myDelegateMultiAddress = toMultiAddress(myDelegateAddress);

  /** 1. setup proxy account for it to your own **/
  /** Make sure your signer account have enough funds **/
  const proxySetup = await createProxy(api, myDelegateMultiAddress);
  console.log("Proxy setup:", proxySetup);

  /** 2. Test teleportToRelayChain **/
  const nextNonce = await api.query.System.Account.getEntries();
  const relayChainTeleport = await teleportToRelayChain(
    myAccount,
    BigInt(2035201351731),
  ).signAndSubmit(buildAccountSigner());
  console.log("Teleport to RelayChain:", relayChainTeleport);

  /** 3. remove proxy **/
  const removeProxyCall = await removeProxy(api, myDelegateMultiAddress);
  console.log("Proxy removed:", removeProxyCall);

  disconnect();
}

main().catch(console.error);
