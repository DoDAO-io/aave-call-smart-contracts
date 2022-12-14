# Problem Statement

Aave is a decentralized finance (DeFi) platform that offers users the ability to lend and borrow cryptocurrency. The platform specializes in overcollateralized loans, where borrowers must deposit a higher value of cryptocurrency than the amount they wish to borrow. This protects lenders from potential losses due to loan defaults, and allows the Aave protocol to liquidate the collateral if it decreases significantly in value.

Our goal is to build a simple example of how to build a Dapp that allows users to interact with the Aave protocol on the Ethereum blockchain and demonstrate how you can further interact with Aave and build applications on top of it. 

So, the idea for this DApp is to allow users to receive undercollateralized loan from Aave. For this, we will create a DApp that works on top of Aave smart contracts and adds part of the collateral from our side so that the user receives more loan from Aave than the amount of collateral he has deposited and Aave is still providing overcollateralized loan, so a win-win for both sides. The amount of collateral we top up is 50% of the amount eligible for the user. 

So the user supplies USDC tokens and receives LINK tokens in return based on the USDC threshold in Aave i.e. 85%. Our contract then tops up the user's LINK amount by 50% of the eligibility.

To create the DApp we used the [starter dapp template](https://github.com/DoDAO-io/dodao-simple-contract-template) that we built in the previous chapter. 

# Template Stack Overview

* Solidity (To write our smart contract)
* Hardat (build, test and deployment framework)
* React (Create our frontend)
* Ethers (web3 library for interacting with the blockchain and our smart contract)
* MetaMask (Wallet browser extension)
* Alchemy (node provider)

To use the code in this repository, you will need to have Node.js and npm installed on your computer. Also, please make sure to set up Metamask and Alchemy accounts.

Once you have these tools installed, you can follow these steps to setup the code:

* Download or clone the repository to your local computer using git:
  ```shell
  git clone https://github.com/DoDAO-io/aave-call-smart-contracts.git 
  ```

* Navigate to the root directory of the repository and install the project dependencies using npm:
  ```shell
  npm install
  ```

* Compile the smart contract code by running the following command:
  ```shell
  npx hardhat compile
  ```

* Deploy the smart contract to the Goerli network by running the deploy script:
  ```shell
  npx hardhat run scripts/compile.ts
  npx hardhat run scripts/old-deploy.ts --network goerli
  ```

* We use an upgradable smart contract, so to deploy it after making changes you can use:
  ```shell
  npx hardhat run scripts/update.ts --network goerli
  ```

* Once the contract has been deployed, you can interact with it using the frontend directory. This directory contains a simple web application built with React that allows you to send and receive tokens using the deployed contract. To run the frontend, navigate to the frontend directory and run the following commands:
  ```shell
  cd frontend
  npm install
  npm start
  ```

* The frontend should now be running on your local computer. You can access it by visiting `http://localhost:3000` in your web browser.

* In addition to the steps above, the template also includes a Makefile that provides a number of useful commands for working with the project. For example, you can use the make compile command to compile the contract code. You can see the full list of commands by running make or make help.
