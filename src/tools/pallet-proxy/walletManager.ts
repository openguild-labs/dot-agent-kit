import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';

export async function connectToSubstrate(endpoint: string): Promise<ApiPromise> {
  const provider = new WsProvider(endpoint);
  return await ApiPromise.create({ 
    provider,
    noInitWarn: true,
    throwOnConnect: true,
    throwOnUnknown: false
  });
}


export async function addProxy(
  api: ApiPromise,
  sender: KeyringPair,
  proxyAddress: string,
  proxyType: string = 'Any',
  delay: number = 0
): Promise<void> {
  const tx = api.tx.proxy.addProxy(proxyAddress, proxyType, delay);
  await tx.signAndSend(sender);
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
  await tx.signAndSend(sender);
}
