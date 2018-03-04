const SolutionVictim = artifacts.require('SolutionVictim.sol')
const SolutionAttacker = artifacts.require('SolutionAttacker.sol') 

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


contract('Solution Reentrancy', function(accounts) {
  const ERROR_MSG = 'VM Exception while processing transaction: revert'
  const deploying_account = accounts[0]
  const account1 = accounts[1]
  const account2 = accounts[2]
  const account3 = accounts[3]
  const account4 = accounts[4]

  // Helper Functions
  var getBalance = web3.eth.getBalance
  var getBalanceInEth = address => web3.toBigNumber(web3.fromWei(getBalance(address).toNumber())).toNumber()

  beforeEach(async () => {
    this.SolutionVictim = await SolutionVictim.deployed()
    this.SolutionAttacker = await SolutionAttacker.deployed()
  });

  it("should exist", async() =>  {
    await this.SolutionVictim.should.exist
  });

  it("should deposit 90 Ether into the contract", async() =>  {
    await this.SolutionVictim.deposit({from: account1, value: web3.toWei(90, 'ether')})

    var balance = await web3.eth.getBalance(this.SolutionVictim.address)
    var expected = web3.toWei(90)

    balance.toNumber().toString().should.equal(expected)
  });

  it("should show account1 balance as 9", async() =>  {
    var balance = await getBalanceInEth(account1)
    var expected = 10

    balance.should.not.be.above(expected)
  });

  it("SolutionAttacker address should have a balance of 0", async() =>  {
    var attackerBalance = await getBalanceInEth(this.SolutionAttacker.address)
  
    attackerBalance.should.equal(0)
  });

  it("should attack SolutionVictim and fail, since we cannot recurisvely call withdraw", async() =>  {
    await this.SolutionAttacker.collect({from: account1, value: web3.toWei(1, "ether")}).should.be.rejectedWith(ERROR_MSG)
  });

  it("should allow a honest user to deposit 1 ether", async() =>  {
    var prevBalance = getBalanceInEth(account4)

    await web3.eth.sendTransaction({from: account4, to: this.SolutionVictim.address, value: web3.toWei(1, "ether")})

    var balance = getBalanceInEth(account4)

    balance.should.not.be.above(prevBalance - 1)
  });

  it("should allow a honest user to withdraw 1 ether", async() =>  {
    var prevBalance = getBalanceInEth(account4)

    await this.SolutionVictim.withdraw({from: account4})

    var balance = getBalanceInEth(account4)

    balance.should.be.above(prevBalance)
  });

  it("should show honest user balance in contract as 0", async() =>  {
    var balance = await this.SolutionVictim.getBalance({from: account4})  
    balance = balance.c[0]

    balance.should.be.equal(0)
  });

  it("should throw error as user cannot withdraw anymore", async() =>  {
    var balance = await this.SolutionVictim.withdraw({from: account4}).should.be.rejectedWith(ERROR_MSG)
  });

  it("should show honest user can deposit and not be locked out", async() =>  {
    await web3.eth.sendTransaction({from: account4, to: this.SolutionVictim.address, value: web3.toWei(1, "ether")})

    var balance = await this.SolutionVictim.getBalance({from: account4})  
    balance = web3.fromWei(balance.toNumber())

    balance.should.be.equal('1')
  });

});
