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

