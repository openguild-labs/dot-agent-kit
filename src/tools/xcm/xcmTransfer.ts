import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { SubmittableResultValue } from '@polkadot/api/types';
import { XcmTransferParams } from './xcmTypes';

export class XcmTransferManager {
  private api: ApiPromise;
  private sender: KeyringPair;

  constructor(api: ApiPromise, sender: KeyringPair) {
    this.api = api;
    this.sender = sender;
  }

  async transferToParachain(params: XcmTransferParams): Promise<SubmittableResultValue> {
    const { sourceChain, destChain, recipient, amount } = params;
    
    // Validate chains
    if (!this.isValidChain(sourceChain) || !this.isValidChain(destChain)) {
      throw new Error('Invalid chain specified');
    }

    // Validate amount
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Check if transferring from Relay chain or Parachain
    const isFromRelayChain = sourceChain === 'Westend';
    
    const dest = {
      V3: {
        parents: isFromRelayChain ? 0 : 1,
        interior: isFromRelayChain ? {
          X1: {
            Parachain: Number(destChain)
          }
        } : {
          Here: "NULL"
        }
      }
    };

    const beneficiary = {
      V3: {
        parents: 0,
        interior: {
          X1: {
            AccountId32: {
              id: this.api.createType('AccountId32', recipient).toU8a(),
              network: null
            }
          }
        }
      }
    };

    const assets = {
      V3: [{
        id: {
          Concrete: {
            interior: {
              Here: "NULL"
            },
            parents: isFromRelayChain ? 0 : 1
          }
        },
        fun: {
          Fungible: amount
        }
      }]
    };

    try {
      const tx = isFromRelayChain 
        ? await this.api.tx.xcmPallet.limitedTeleportAssets(
            dest,
            beneficiary, 
            assets,
            0,
            { Unlimited: "NULL" }
          )
        : await this.api.tx.xcmPallet.limitedReserveTransferAssets(
            dest,
            beneficiary,
            assets,
            0,
            { Unlimited: "NULL" }
          );

      return new Promise((resolve, reject) => {
        tx.signAndSend(this.sender, ({ status, events = [], txHash }) => {
          if (status.isFinalized) {
            console.log(`✅ Transaction finalized in block: ${status.asFinalized}`);
            resolve({ status, events, txHash });
          }
        }).catch((error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('XCM Transfer error:', error);
      throw new Error(`XCM Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isValidChain(chain: string): boolean {
    const validChains = ['Westend', 'Asset Hub', 'relay'];
    const isParachainId = !isNaN(Number(chain));
    return validChains.includes(chain) || isParachainId;
  }
}