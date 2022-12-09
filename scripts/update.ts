const { ethers, upgrades } = require("hardhat");
import { Aave } from "./../typechain-types/contracts/Aave";
import contractAdresses from "./../frontend/src/contracts/contract-address.json";

async function main() {
  const Aave = await ethers.getContractFactory("Aave");
  await upgrades.upgradeProxy(contractAdresses.Aave, Aave);

  console.log("Contract Updated");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
