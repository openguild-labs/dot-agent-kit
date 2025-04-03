import { PolkadotAgentKit } from '../../src/agent';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import dotenv from 'dotenv';
import * as sinon from 'sinon';

dotenv.config();

/* Use private key for testing */
const TEST_PRIVATE_KEY = process.env.PRIVATE_KEY || '';
/* Create a second private key */
const TEST_PRIVATE_KEY_2 = process.env.DELEGATE_PRIVATE_KEY || '';

/* Mnemonic for real environment, in test will skip this test case if there is no mnemonic */
const TEST_MNEMONIC = process.env.MNEMONIC || '';

describe('PolkadotAgentKit Key Types and Mnemonic', () => {
  let initializeStub: sinon.SinonStub;
  let consoleLogStub: sinon.SinonStub;
  let consoleWarnStub: sinon.SinonStub;

  before(() => {
    /* Disable initialization process to avoid repeated notifications */
    initializeStub = sinon.stub(PolkadotAgentKit.prototype as any, 'initialize').resolves();
    
    /* Disable console.log and console.warn to remove notifications */
    consoleLogStub = sinon.stub(console, 'log');
    consoleWarnStub = sinon.stub(console, 'warn');
  });

  after(() => {
    /* Restore original functions after test completion */
    initializeStub.restore();
    consoleLogStub.restore();
    consoleWarnStub.restore();
  });

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

  /* Test case 2: Use mnemonic phrase instead of private key (conditional) */
  (TEST_MNEMONIC ? it : it.skip)('can create account from mnemonic', async () => {
    /* Ensure mnemonic is not undefined */
    if (!TEST_MNEMONIC) {
      throw new Error("TEST_MNEMONIC is required for this test");
    }

    const agent = new PolkadotAgentKit({
      mnemonic: TEST_MNEMONIC, /* already checked above so definitely not undefined */
      chains: [] /* No need to connect chains in this test */
    });

    /* Check if the address is created correctly */
    expect(agent.address).to.be.a('string');
    expect(agent.address.length).to.be.greaterThan(0);
    
    /* Check if the public key is created correctly */
    const publicKey = agent.getMainPublicKey();
    expect(publicKey).to.be.instanceOf(Uint8Array);
  });

  /* Test case 3: Combine different key types */
  it('can combine different key types for main and delegate accounts', async () => {
    const agent = new PolkadotAgentKit({
      privateKey: TEST_PRIVATE_KEY,
      keyType: 'Sr25519',
      delegatePrivateKey: TEST_PRIVATE_KEY_2,
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
    
    expect(mainSigner).to.not.be.undefined;
    expect(delegateSigner).to.not.be.undefined;
  });

  /* Test case 4: Use different private keys */
  it('should use different addresses for different private keys', async () => {
    /* Create agents with different private keys */
    const agent1 = new PolkadotAgentKit({
      privateKey: TEST_PRIVATE_KEY,
      keyType: 'Sr25519',
      chains: [] /* No need to connect chains in this test */
    });
    
    const agent2 = new PolkadotAgentKit({
      privateKey: TEST_PRIVATE_KEY_2, /* Use a different private key */
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
  
  /* Test case 5: Create agent with both main and delegate from different keys */
  it('can create agent with both main and delegate accounts from different keys', async () => {
    const agent = new PolkadotAgentKit({
      privateKey: TEST_PRIVATE_KEY,
      keyType: 'Sr25519',
      delegatePrivateKey: TEST_PRIVATE_KEY_2, /* Use a different private key */
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