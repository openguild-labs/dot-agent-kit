import { PolkadotAgentKit } from '../../src/agent';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

/* This test always runs because we will use mock */
const TEST_MNEMONIC = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk';

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
  
  it('can use Sr25519 with mnemonic', async () => {
    /* Use empty chains array to avoid chain descriptors */
    const agent = new PolkadotAgentKit({
      mnemonic: TEST_MNEMONIC,
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
      mnemonic: TEST_MNEMONIC,
      keyType: 'Sr25519',
      derivationPath: '//0',
      delegateMnemonic: TEST_MNEMONIC,
      delegateDerivationPath: '//1',
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
