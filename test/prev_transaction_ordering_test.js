const TransactionOrdering = artifacts.require('TransactionOrdering.sol')

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('TransactionOrdering', function(accounts) {
  
  const ERROR_MSG = 'VM Exception while processing transaction: revert';
  const deploying_account = accounts[0];
  const account1 = accounts[1];
  const account2 = accounts[2];
  const account3 = accounts[3];
  const account4 = accounts[4];

  beforeEach(async () => {
    this.TransactionOrdering = await TransactionOrdering.new({from: deploying_account});
  });

  it("should exist", async() =>  {
    await this.TransactionOrdering.should.exist
  });

  it("should buy returns price", async() => {
    var price = await this.TransactionOrdering.buy.call({from: account1});
    console.log("Account 1: " + account1)
    console.log(price)
    price.toNumber().should.equal(100)
  });

  it("should update price", async() => {
    await this.TransactionOrdering.setPrice(120, {from: deploying_account});
    var price = await this.TransactionOrdering.buy.call({from: account1, gas:200000});
    console.log("Deploying Account: " + deploying_account)
    console.log(price)

    price.toNumber().should.equal(120)
  });

  it("should should fail since only owner can set price", async() => {
    await this.TransactionOrdering.setPrice(120, {from: account1}).should.be.rejectedWith(ERROR_MSG);
  });

  function requestAsync(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(err, res, body) {
            if (err) { return reject(err); }
            return resolve([res, body]);
        });
    });
}

  it("should should return the price as 150 since owner has used more gas to cause race conditions", async() => {

    var price = await this.TransactionOrdering.buy.call({from: account1, gas:200000});
    await this.TransactionOrdering.setPrice(150, {from: deploying_account, gas:1000000});

    console.log(price.toNumber())
  })
});  



