import { PolkadotAgentKit } from '../agent/index';
import { ApiPromise } from '../tools/substrace/substraceConnector';
import { teleportToParaChain, teleportToRelayChain } from '../../src/tools/xcm/teleport/teleport';
import { addressOfSubstrate, publicKeyOf, buildAccountSigner } from '../types/account';

export class PolkadotTools {
  private agent: PolkadotAgentKit;

  constructor(agent: PolkadotAgentKit) {
    this.agent = agent;
  }

  /**
   * Perform XCM transfer to Relay Chain
   */
  async xcmTransferToRelayChain(
    chainName: string,
    amount: bigint,
    recipient?: string,
  ): Promise<string> {
    const { api } = this.agent.getConnection(chainName);
    const signer = buildAccountSigner(); // Assumes this uses the main account's private key from env
    const tx = teleportToRelayChain(
      recipient || this.agent.address,
      amount,
    );
    const result = await tx.signAndSubmit(signer);
    return result.txHash.toString();
  }

  /**
   * Perform XCM transfer to ParaChain
   */
  async xcmTransferToParaChain(
   account: string,
   ammount: bigint
  ): Promise<string> {
    // const { api } = this.agent.getConnection(chainName);
    const signer = buildAccountSigner();
    const tx = teleportToParaChain(
      account,
      ammount,
    );
    const result = await tx.signAndSubmit(signer);
    return result.txHash.toString();
  }

}