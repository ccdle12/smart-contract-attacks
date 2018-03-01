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

Transaction Ordering Attacks is a race condition attack. Two transactions will be sent to the mempool/tx-pool, the order in which they are sent is irrelevant according to the gas sent to incentivize miners to mine their transactions first.

### Scenario:
Participants:

    * Buyer 

    * Owner of Contract

Contract:

    * uint Price: Storage Variable

    * buy(): Function to "buy a virtual good" at the price set at the Storage Variable

    * setPrice(): Function used by the owner of the Contract to update the Price storage variable

1. The buyer will call the buy() to purchase the virtual good at the price specified in the storage variable with a starting price=100.

2. The contract owner will call setPrice() and update the price storage variable to price=150.

3. The contract owner will send the transaction with a higher gas fee.

4. Contract owner's transaction will be mined first, updating the state of the contract

5. Buyers transaction gets mined soon after, but now the buy() function will be using the new updated price=150.

6. Buyer sends buy() to buy at price=100 but after the transaction is complete, the buyer has bought the "virtual goods" at price=150, since the contract owners transaction was mined before the buyer even though the buyer sent the transaction to the mempool/txpool first, thus updating the price storage variable before buyers transaction is complete.

Pre-Solution Contract is:
```
PrevTransactionOrdering.sol
```


