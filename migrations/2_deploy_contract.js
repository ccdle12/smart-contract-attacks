var PrevTransactionOrdering = artifacts.require('PrevTransactionOrdering.sol')

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(PrevTransactionOrdering);
};
