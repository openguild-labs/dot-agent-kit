import { PolkadotAgentKit } from '../../src/agent';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import dotenv from 'dotenv';

dotenv.config();

/* Mnemonic for real environment, in test will skip this test case if there is no mnemonic */
const TEST_MNEMONIC = process.env.MNEMONIC || '';
/* Private key for test */
const TEST_PRIVATE_KEY = process.env.PRIVATE_KEY || '';

describe('PolkadotAgentKit Integration Test with Key Types', function() {
  let initializeStub: sinon.SinonStub;
  
  const mockApi = {
    tx: {
      System: {
        remark: (message: string) => ({
          signAndSend: async () => ({ hash: '0x' + '1'.repeat(64) })
        })
      }
    }
  };

  before(() => {
    /* Stub the initialize function BEFORE running the tests */
    initializeStub = sinon.stub(PolkadotAgentKit.prototype as any, 'initialize').resolves();
  });

  beforeEach(() => {
    /* Create other stubs for each test */
    sinon.stub(PolkadotAgentKit.prototype, 'getConnection')
      .resolves({ api: mockApi, disconnect: () => {} });
    
    sinon.stub(PolkadotAgentKit.prototype, 'waitForInitialization')
      .resolves();
    
    sinon.stub(PolkadotAgentKit.prototype, 'disconnectAll')
      .resolves();
  });

  afterEach(() => {
    /* Restore all stubs after each test, EXCEPT initializeStub */
    sinon.restore();
  });
  
  after(() => {
    /* Restore initializeStub after all tests are completed */
    initializeStub.restore();
  });
  
  (TEST_MNEMONIC ? it : it.skip)('can use Sr25519 with mnemonic', async () => {
    /* Ensure mnemonic is not undefined */
    if (!TEST_MNEMONIC) {
      throw new Error("TEST_MNEMONIC is required for this test");
    }

    /* Use empty chains array to avoid chain descriptors */
    const agent = new PolkadotAgentKit({
      mnemonic: TEST_MNEMONIC, /* already checked above so definitely not undefined */
      keyType: 'Sr25519', 
      chains: []  /* IMPORTANT: Use empty array */
    });
    
    /* Check key type */
    expect((agent as any).mainKeyType).to.equal('Sr25519');
    
    /* Create signer */
    const signer = agent.createMainSigner();
    
    /* Do not check actual transaction, only check signer */
    expect(signer).to.not.be.undefined;
    
    /* Simulate sending transaction */
    const { api } = await agent.getConnection('westend');
    const tx = api.tx.System.remark('Test');
    const result = await tx.signAndSend(signer);
    expect(result.hash).to.equal('0x' + '1'.repeat(64));
  });
  
  it('can combine different key types for main and delegate accounts', async () => {
    /* Use empty chains array */
    const agent = new PolkadotAgentKit({
      privateKey: TEST_PRIVATE_KEY,
      keyType: 'Sr25519',
      delegatePrivateKey: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      delegateKeyType: 'Ed25519',
      chains: []  /* IMPORTANT: Use empty array */
    });
    
    /* Check key types */
    expect((agent as any).mainKeyType).to.equal('Sr25519');
    expect((agent as any).delegateKeyType).to.equal('Ed25519');
    
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