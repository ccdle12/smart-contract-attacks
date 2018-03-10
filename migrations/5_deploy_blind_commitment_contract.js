const BlindCommitments = artifacts.require("BlindCommitments.sol")

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(BlindCommitments, 1000, '0x80000000000000001')
};
