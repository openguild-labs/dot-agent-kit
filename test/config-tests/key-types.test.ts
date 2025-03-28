import { PolkadotAgentKit } from '../../src/agent';
import { expect } from 'chai';
import { describe, it } from 'mocha';
/* Test mnemonic (FOR TESTING ONLY) */
const TEST_MNEMONIC = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk';
/* Test private key (FOR TESTING ONLY) */
const TEST_PRIVATE_KEY = '0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133';

describe('PolkadotAgentKit Key Types and Mnemonic', () => {
  /* Test case 1: Use Sr25519 instead of default Ed25519 */
  it('can use Sr25519 instead of default Ed25519', async () => {
    const agent = new PolkadotAgentKit({
      privateKey: TEST_PRIVATE_KEY,
      keyType: 'Sr25519',
      chains: [] /* No need to connect chains in this test */
    });

    /* Check if keyType is set correctly */
    expect((agent as any).mainKeyType).to.equal('Sr25519');
    
    /* Check delegateKeyType should be the same as mainKeyType when not specified */
    expect((agent as any).delegateKeyType).to.equal('Sr25519');
  });

  /* Test case 2: Use mnemonic phrase instead of private key */
  it('can create account from mnemonic', async () => {
    const agent = new PolkadotAgentKit({
      mnemonic: TEST_MNEMONIC,
      chains: [] /* No need to connect chains in this test */
    });

    /* Check if address is created correctly */
    expect(agent.address).to.be.a('string');
    expect(agent.address.length).to.be.greaterThan(0);
    
    /* Check if public key is created correctly */
    const publicKey = agent.getMainPublicKey();
    expect(publicKey).to.be.instanceOf(Uint8Array);
  });

  /* Test case 3: Combine different key types */
  it('can combine different key types for main and delegate accounts', async () => {
    const agent = new PolkadotAgentKit({
      mnemonic: TEST_MNEMONIC,
      keyType: 'Sr25519',
      delegatePrivateKey: TEST_PRIVATE_KEY,
      delegateKeyType: 'Ed25519',
      chains: [] /* No need to connect chains in this test */
    });

    /* Check key types */
    expect((agent as any).mainKeyType).to.equal('Sr25519');
    expect((agent as any).delegateKeyType).to.equal('Ed25519');
    
    /* Check both addresses are created */
    expect(agent.address).to.be.a('string');
    expect(agent.delegateAddress).to.be.a('string');
    
    /* Check signers */
    const mainSigner = agent.createMainSigner();
    const delegateSigner = agent.createDelegateSigner();
    
    expect((agent as any).mainKeyType).to.equal('Sr25519');
    expect((agent as any).delegateKeyType).to.equal('Ed25519');
  });

  /* Test case 4: Use different derivation paths with mnemonic */
  it('can use different derivation paths with mnemonic', async () => {
    /* Create agents with different derivation paths */
    const agent1 = new PolkadotAgentKit({
      mnemonic: TEST_MNEMONIC,
      derivationPath: '//0',
      keyType: 'Sr25519',
      chains: [] /* No need to connect chains in this test */
    });
    
    const agent2 = new PolkadotAgentKit({
      mnemonic: TEST_MNEMONIC, 
      derivationPath: '//1',
      keyType: 'Sr25519',
      chains: [] /* No need to connect chains in this test */
    });
    
    /* Check the two addresses must be different */
    expect(agent1.address).to.not.equal(agent2.address);
    
    /* The two public keys must also be different */
    const publicKey1 = agent1.getMainPublicKey();
    const publicKey2 = agent2.getMainPublicKey();
    
    expect(publicKey1).to.not.deep.equal(publicKey2);
  });
  
  /* Test case 5: Create agent with both main and delegate from mnemonic */
  it('can create agent with both main and delegate accounts from mnemonic', async () => {
    const agent = new PolkadotAgentKit({
      mnemonic: TEST_MNEMONIC,
      derivationPath: '//0',
      keyType: 'Sr25519',
      delegateMnemonic: TEST_MNEMONIC,
      delegateDerivationPath: '//1',
      delegateKeyType: 'Sr25519',
      chains: [] /* No need to connect chains in this test */
    });
    
    /* Check both addresses are created */
    expect(agent.address).to.be.a('string');
    expect(agent.delegateAddress).to.be.a('string');
    expect(agent.address).to.not.equal(agent.delegateAddress);
    
    /* Check signers */
    const mainSigner = agent.createMainSigner();
    const delegateSigner = agent.createDelegateSigner();
    
    expect(mainSigner).to.not.be.undefined;
    expect(delegateSigner).to.not.be.undefined;
  });
});
