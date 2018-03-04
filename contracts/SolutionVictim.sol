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