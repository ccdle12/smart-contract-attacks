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
    var balance = await getBalance(account1)
    var balance = balance.c[0]

    var expected = 100000

    balance.should.not.be.above(expected)
  });

  it("SolutionAttacker address should have a balance of 0", async() =>  {
    var attackerBalance = await getBalance(this.SolutionAttacker.address)
    
    var balance = attackerBalance.c[0]

    balance.should.equal(0)
  });

  it("should attack SolutionVictim and have a balance of 50 ether", async() =>  {

    await this.SolutionAttacker.collect({from: account1, value: web3.toWei(1, "ether")})

    var balance = await getBalanceInEth(this.SolutionAttacker.address)

    console.log("SolutionVictim Balance after attack: " + await getBalance(this.SolutionVictim.address))
    console.log("Balance after attack: " + balance)
   
    var expected = 50

    balance.should.be.equal(expected)
  });

  it("should kill attacking contract and siphone all the funds to account1", async() =>  {

    var beforeKill = await getBalance(account1).toNumber()
    console.log("Account1 Balance before kill contract: " + beforeKill)

    await this.SolutionAttacker.kill({from: account1})

    var afterKill = await getBalance(account1).toNumber()
    console.log("Account1 Balance after kill contract: " + afterKill)

    afterKill.should.be.above(beforeKill)
  });

  it("should show SolutionAttacker contract drained of funds", async() =>  {

    var attackerBalance = await getBalance(this.SolutionAttacker.address).toNumber()
    var expected = 0

    attackerBalance.should.equal(expected)
  });


});
