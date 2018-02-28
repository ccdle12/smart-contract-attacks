# Private-Chain-Scaffold

A Private Chain Scaffold - mainly will be used for testing and attacking Smart Contracts

### Prerequisites

Install Geth via instructions on website

```
https://www.ethereum.org/cli
```

Install Truffle via npm

```
npm i -g truffle
```

## Installation

(Guide to starting from scratch, if you git pull this project, this will be setup already)

### Initialze the Project with Truffle

```
truffle init
```

Create the data directory folder to hold the Private Chain Data

```
mkdir data
cd data
```

Create the Genesis Block using a JSON file

Run the first command and then copy the code below
```
cat > genesis.json
```

```
{
    "config": {
        "chainId": 100,
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0
    },
    "difficulty": "0x0400",
    "gasLimit": "0x8000000",
    "alloc": {
         "<enter new account address here>": {
		"balance": "30000000000000000000000000"
	}
     }
}
```


### Initialize the Genesis Block via the geth cli

Run the first command and then paste the code below
```
cat > init-genesis.sh
```

```
#!/bin/bash
geth -datadir="./data" init-genesis.json
```

Make the script executable
```
chmod +x init-genesis.sh
```

### Create script to launch Geth Console
Go back to root folder

```
cd ../
```

Create the script to launch geth console

Run the first command and then copy the code below
```
cat > geth-console.sh 
```

```
#!/bin/bash
geth --datadir "./data" --rpc --networkid 100 console
```

Make the script executable
```
chmod +x geth-console.sh
```

### Create script to create new account
Create the script to launch geth console

Run the first command and then copy the code below
```
cat > init-new-account.sh 
```

```
#!/bin/bash
geth --datadir "./data" account new
```

Make the script executable
```
chmod +x init-new-account.sh
```

### Set up the Truffle.js file
```
vi truffle.js
```

Paste the development config
```
networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: "100",
      gas:4712388,   
    }
}
```

### Create truffle compile and migration script
Run the first command and then copy the code below
```
cat > tcm.sh 
```

```
#!/bin/bash
rm -rf build
truffle compile
truffle migrate
```

Make the script executable
```
chmod +x tcm.sh
```


## Running

### Run new account script and copy address
Run script
```
./init-new-account.sh
```

Create a password (remember it)
Copy Address

```
cd ./data
```

Paste address in "alloc"
