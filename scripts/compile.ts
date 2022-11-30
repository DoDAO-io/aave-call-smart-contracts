const path = require("path");
const fs = require("fs");

function copyFrontendFiles() {
  const contractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );

  fs.rmdirSync(contractsDir, { recursive: true });

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

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
    { recursive: true, force: true }
  );
}

copyFrontendFiles();
