import fs from "fs";
import { artifacts, ethers } from "hardhat";
import { Token } from "./../typechain-types/contracts/Token";
import { Aave } from "./../typechain-types/contracts/Aave";
const path = require("path");


function saveContractAdresses(token: Token, aave: Aave) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: token.address, Aave: aave.address }, undefined, 2)
  );

}

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = ethers.utils.parseEther("0.001");

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  console.log("Token address:", token.address);

  const Aave = await ethers.getContractFactory("Aave");
  const aave = await Aave.deploy();
  await aave.deployed();

  console.log("Token address:", aave.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveContractAdresses(token, aave);

  console.log(
    `Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${token.address}`
  );
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
