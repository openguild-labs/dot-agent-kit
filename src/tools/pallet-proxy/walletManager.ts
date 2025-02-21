import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';

export async function connectToSubstrate(endpoint: string): Promise<ApiPromise> {
  const provider = new WsProvider(endpoint);
  return await ApiPromise.create({ provider });
}


export async function addProxy(
  api: ApiPromise,
  sender: KeyringPair,
  proxyAddress: string,
  proxyType: string = 'Any',
  delay: number = 0
): Promise<void> {
  const tx = api.tx.proxy.addProxy(proxyAddress, proxyType, delay);
  const hash = await tx.signAndSend(sender);
  console.log(`✅ Proxy added! Transaction hash: ${hash.toHex()}`);
}


export async function checkProxy(
  api: ApiPromise,
  owner: string,
  proxy: string
): Promise<boolean> {
  try {
    const proxies = await api.query.proxy.proxies(owner);
    const [proxyList] = proxies.toJSON() as [Array<{ delegate: string }>, number];
    return proxyList.some((p) => p.delegate === proxy);
  } catch (error) {
    console.error("Error checking proxy:", error);
    return false;
  }
}

export async function removeProxy(
  api: ApiPromise,
  sender: KeyringPair,
  proxyAddress: string,
  proxyType: string = 'Any'
): Promise<void> {
  const tx = api.tx.proxy.removeProxy(proxyAddress, proxyType, 0);
  const hash = await tx.signAndSend(sender);
  console.log(`✅ Proxy removed! Transaction hash: ${hash.toHex()}`);
}
