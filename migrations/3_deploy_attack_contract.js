var Victim = artifacts.require('Victim.sol')
var Attacker = artifacts.require('Attacker.sol')

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(Victim).then(() =>  deployer.deploy(Attacker, Victim.address))
};