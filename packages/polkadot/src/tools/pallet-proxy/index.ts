import { ApiPromise } from "../substrace";
import { Enum, TxCallData } from "polkadot-api";
import {
  buildAccountSigner,
  buildAccountDelegateProxySigner,
} from "@openguild-labs/agent-kit-common";
// import { MultiAddress } from "@polkadot-api/descriptors";

// export async function createProxy(
//   api: ApiPromise,
//   delegate: MultiAddress,
// ): Promise<string> {
//   const result = await api.tx.Proxy.add_proxy({
//     delegate: delegate,
//     proxy_type: Enum("Any", undefined),
//     delay: 0,
//   }).signAndSubmit(buildAccountSigner());
//   return result.txHash;
// }

// export async function removeProxy(
//   api: ApiPromise,
//   delegate: MultiAddress,
// ): Promise<string> {
//   const result = await api.tx.Proxy.remove_proxy({
//     delegate: delegate,
//     proxy_type: Enum("Any", undefined),
//     delay: 0,
//   }).signAndSubmit(buildAccountSigner());
//   return result.txHash;
// }

// type ProxyParams = {
//   address: MultiAddress;
//   call: TxCallData;
// };
// export async function callAsProxy(
//   api: ApiPromise,
//   params: ProxyParams,
// ): Promise<string> {
//   const result = await api.tx.Proxy.proxy({
//     real: params.address,
//     call: params.call,
//     force_proxy_type: Enum("Any", undefined),
//   }).signAndSubmit(buildAccountDelegateProxySigner());
//   return result.txHash;
// }

// export async function transferKeepAlive(
//   api: ApiPromise,
//   to: MultiAddress,
//   amount: bigint,
// ): Promise<TxCallData> {
//   const call = api.tx.Balances.transfer_keep_alive({
//     dest: to,
//     value: amount,
//   }).decodedCall;

//   return call;
// }
