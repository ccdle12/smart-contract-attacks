var TransactionOrdering = artifacts.require('TransactionOrdering.sol')
var SolutionTransactionOrdering = artifacts.require('SolutionTransactionOrdering.sol')

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(TransactionOrdering);
  deployer.deploy(SolutionTransactionOrdering);
};
