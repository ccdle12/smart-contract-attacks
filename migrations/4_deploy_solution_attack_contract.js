var SolutionAttacker = artifacts.require('SolutionAttacker.sol')
var SolutionVictim = artifacts.require('SolutionVictim.sol')

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(SolutionVictim).then(() => deployer.deploy(SolutionAttacker, SolutionVictim.address))
};