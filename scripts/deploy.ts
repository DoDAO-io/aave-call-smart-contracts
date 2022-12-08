const { ethers, upgrades } = require("hardhat");
import { Aave } from "./../typechain-types/contracts/Aave";

const path = require("path");

function saveContractAdresses(aave: Aave) {
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
    JSON.stringify({ Aave: aave.address }, undefined, 2)
  );
}

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = ethers.utils.parseEther("0.001");

  const Aave = await ethers.getContractFactory("Aave");
  const aave = await upgrades.deployProxy(Aave);
  await aave.deployed();

  console.log("Token address:", aave.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveContractAdresses(aave);

  console.log(
    `Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${aave.address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
