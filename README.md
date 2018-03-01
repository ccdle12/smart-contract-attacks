# Smart Contract Attacks

Creating Contracts and Testing possible Attacks

## Prerequisites

Install Geth via instructions on website

```
https://www.ethereum.org/cli
```

Install Truffle via npm

```
npm i -g truffle
```

## Setup

I am using [Solidity Remix online compiler](https://remix.ethereum.org) to deploy and manually test contract attacks.

This is due to the current difficulty of simulating race conditions in certain tests as testrpc (to my knowledge) cannot behave like a miner, namely mining transactions with higher gas fees first regardless of the order of transactions received.

## Transaction Ordering Attacks

Transaction Ordering Attacks is a race condition attack. Two transactions will be sent to the mempool/tx-pool, the order in which they are sent is irrelevant according to the gas sent to incentivize miners to mine their transactions first.

### Scenario:
Two Participants:
    * Buyer 
    * Owner of Contract

Contract:
    * uint Price: Storage Variable
    * buy(): Function to "buy a virtual good" at the price set in the Storage Variable
    * setPrice(): Function used by the owner of the Contract to update the Price storage variable

* The buyer will call the buy() to purchase the virtual good at the price specified in the storage * variable.

* The contract owner will call setPrice() and update the price storage variable.

* The contract owner will send the transaction with a higher gas fee.

* Contract owners transaction will be mined first, updating the state of the contract

* Buyers transaction gets mined soon after, but now the buy() function will be using the new updated price

* Buyer sends buy() to buy at 100 but after the transaction is complete, the buyer has bought the "virtual goods" at 150 since the contract owners transaction was mined before the buyer even though the buyer sent the transaction to the mempool/txpool first

Pre-Solution Contract is:
```
PrevTransactionOrdering.sol
```


