const BlindCommitments = artifacts.require('BlindCommitments.sol')

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


contract('BlindCommitments', function(accounts) {
  
  const ERROR_MSG = 'VM Exception while processing transaction: revert'
  const deploying_account = accounts[0]
  const miner1 = accounts[1]
  const miner2 = accounts[2]
  const miner3 = accounts[3]
  const account4 = accounts[4]

  beforeEach(async () => {
    this.BlindCommitments = await BlindCommitments.deployed();
  });

  it("should exist", async() =>  {
    await this.BlindCommitments.should.exist
  });

  // Should simulate mining and fail with nonce 1
  it("should mine to find the nonce and fail", async() => {
    await this.BlindCommitments.mine(1, {from: miner1}).should.be.rejectedWith(ERROR_MSG)
  });

  it("should mine to find the nonce and fail using 8", async() => {
    await this.BlindCommitments.mine(8, {from: miner2}).should.be.rejectedWith(ERROR_MSG)
  });

  it("should mine to find the nonce and pass using 2", async() => {
    var hashOfCommit = await this.BlindCommitments.mine(2, {from: miner3})

    hashOfCommit.should.equal('0xe5a5baa1d0f5de7a')
  });

  // Commit Blind Commit to the contract as the winning miner
  it("should mine to find the nonce and pass using 2", async() => {
    // Maps blindCommitment hash to the block number
    await this.BlindCommitments.blindCommitment('0xe5a5baa1d0f5de7a', {from: miner3})
  });

  it("winning miner tries to claim reward before blockWait time and reveals secret", async() => {
    await this.BlindCommitments.claimReward(2, {from: miner3}).should.be.rejectedWith(ERROR_MSG)
  });

  it("Malicous attackers try to claim reward, somehow know the secret but not the sender", async() => {
    await this.BlindCommitments.claimReward(2, {from: miner1}).should.be.rejectedWith(ERROR_MSG)
  });

  it("should skipBlocks to get past the blockWeight Time and malicious attacker should not be able to claimReward", async() => {

    for (var i = 0; i < 4; i++)
      await this.BlindCommitments.skipBlock()
    
      await this.BlindCommitments.claimReward(2, {from: miner1}).should.be.rejectedWith(ERROR_MSG)
  });

  it("should skipBlocks to get past the blockWeight Time and winning miner should reveal secret able to claimReward", async() => {

    for (var i = 0; i < 4; i++)
      await this.BlindCommitments.skipBlock()
    
      await this.BlindCommitments.claimReward(2, {from: miner3})
  });
});
