pragma solidity ^0.4.4;

contract BlindCommitments {

  //Storage Variables
  bytes8 public difficultyTarget;
  uint256 public reward;
  address public owner;
  mapping (bytes8 => uint) commits;
  uint blockWait = 4;

  // constructor
  function BlindCommitments(uint256 initialReward, bytes8 difficulty) public {
    owner = msg.sender;
    reward = initialReward;
    difficultyTarget = difficulty;
  }

  // change difficulty
  function setDiff(bytes8 difficulty) external {
    require(owner == msg.sender);
    difficultyTarget = difficulty;
  }

  // mine for valid nonce
  function mine(uint8 nonce) external view returns (bytes8) {
    // hash nonce
    bytes8 res = bytes8(keccak256(bytes8(nonce)));

    // difficulty target check
    require(res >= difficultyTarget);

    // returns the blind commitment
    bytes8 c = bytes8(keccak256(bytes8(nonce) ^ bytes8(msg.sender)));
    
    return c;
  }

  //submit blind commitment
  function blindCommitment(bytes8 _c) external {
    commits[_c] = block.number;
  }

  // claim reward after X blocks
  function claimReward(uint8 nonce) public {
    // nonce must be valid for difficulty target
    bytes8 res = bytes8(keccak256(bytes8(nonce)));
    require(res >= difficultyTarget);

    // the nonce must have been sent blockWait blocks ago
    bytes8 c = bytes8(keccak256(bytes8(nonce) ^ bytes8(msg.sender)));
    require(commits[c] > 0 && (commits[c] + blockWait) < block.number);

    //transfer funds
    msg.sender.transfer(this.balance);
  }

  function skipBlock() external returns (uint) {
     
  }
}
