import { artifacts, ethers } from "hardhat";
import { Token } from "./../typechain-types/contracts/Token";

const path = require("path");

function copyFrontendFiles() {
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


  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    path.join(contractsDir, "Token.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );

  const AaveArtifact = artifacts.readArtifactSync("Aave");

  fs.writeFileSync(
    path.join(contractsDir, "Aave.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );

  fs.cpSync(
    path.join(__dirname, "..", "typechain-types"),
    path.join(
      __dirname,
      "..",
      "frontend",
      "src",
      "contracts",
      "typechain-types"
    ),
    { recursive: true }
  );
}

copyFrontendFiles();

