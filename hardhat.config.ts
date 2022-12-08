import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Replace this private key with your Goerli account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY!;

const config: HardhatUserConfig = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        accountsBalance: "10000000000000000000000",
        mnemonic: process.env.ACCOUNT_NEUMONIC,
      },
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    scroll: {
      url: process.env.SCROLL_TESTNET_URL,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
  },
};

export default config;
