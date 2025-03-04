import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { SubmittableResultValue } from '@polkadot/api/types';
import { XcmTransferParams, ChainConfig, ChainType } from '../../types/xcmTypes';
import { ChainRegistry } from '../../chain/chainRegistry';
import { ISubmittableResult } from '@polkadot/types/types';

interface TransactionResult {
  status: any;  // or AnyJson
  events: any[];  // or AnyJson[]
  txHash: any;  // or H256
}

export class XcmTransferManager {
  private api: ApiPromise;
  private sender: KeyringPair;
  private chainRegistry: ChainRegistry;

  constructor(api: ApiPromise, sender: KeyringPair, chainRegistry: ChainRegistry) {
    this.api = api;
    this.sender = sender;
    this.chainRegistry = chainRegistry;
  }

  private createXcmDestination(sourceChain: ChainConfig, destChain: ChainConfig) {
    if (sourceChain.type === ChainType.RELAY_CHAIN) {
      return {
        V3: {
          parents: 0,
          interior: {
            X1: {
              Parachain: destChain.parachainId
            }
          }
        }
      };
    }

    return {
      V3: {
        parents: 1,
        interior: destChain.type === ChainType.RELAY_CHAIN ? {
          Here: "NULL"
        } : {
          X1: {
            Parachain: destChain.parachainId
          }
        }
      }
    };
  }

  private createXcmAssets(sourceChain: ChainConfig, amount: bigint) {
    return {
      V3: [{
        id: {
          Concrete: {
            interior: { Here: "NULL" },
            parents: sourceChain.type === ChainType.RELAY_CHAIN ? 0 : 1
          }
        },
        fun: { Fungible: amount }
      }]
    };
  }

  async executeXcmTransfer(params: XcmTransferParams): Promise<SubmittableResultValue> {
    const sourceChain = this.chainRegistry.getChain(params.sourceChain);
    const destChain = this.chainRegistry.getChain(params.destChain);

    if (!sourceChain || !destChain) {
      throw new Error('Invalid source or destination chain');
    }

    const dest = this.createXcmDestination(sourceChain, destChain);
    const beneficiary = {
      V3: {
        parents: 0,
        interior: {
          X1: {
            AccountId32: {
              id: this.api.createType('AccountId32', params.recipient).toU8a(),
              network: null
            }
          }
        }
      }
    };
    const assets = this.createXcmAssets(sourceChain, params.amount);

    try {
      const tx = await this.api.tx[sourceChain.xcmPallet].limitedTeleportAssets(
        dest,
        beneficiary,
        assets,
        0,
        { Unlimited: "NULL" }
      );

      return await this.sendAndWaitForFinalization(tx);
    } catch (error) {
      throw error;
    }
  }

  private async sendAndWaitForFinalization(tx: any): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      tx.signAndSend(this.sender, ({ status, events = [], txHash }: ISubmittableResult) => {
        if (status.isFinalized) {
          resolve({ 
            status: status.toHuman(), 
            events: events.map(e => e.toHuman()), 
            txHash 
          });
        }
      }).catch(reject);
    });
  }
}