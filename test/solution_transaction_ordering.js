const SolutionTransactionOrdering = artifacts.require('SolutionTransactionOrdering.sol')

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


contract('SolutionTransactionOrdering', function(accounts) {
  
  const ERROR_MSG = 'VM Exception while processing transaction: revert';
  const deploying_account = accounts[0];
  const account1 = accounts[1];
  const account2 = accounts[2];
  const account3 = accounts[3];
  const account4 = accounts[4];

  beforeEach(async () => {
    this.SolutionTransactionOrdering = await SolutionTransactionOrdering.new({from: deploying_account});
  });

  it("should exist", async() =>  {
    await this.SolutionTransactionOrdering.should.exist
  });

  it("should be able to purchase, since tx order is 0", async() => {
    var price = await this.SolutionTransactionOrdering.buy.call(0);

    price.toNumber().should.equal(100);
  });

  it("should revert since the owner of contract has changed price", async() => {
    await this.SolutionTransactionOrdering.setPrice(150);
    var price = await this.SolutionTransactionOrdering.buy.call(0).should.be.rejectedWith(ERROR_MSG);
  });
});
