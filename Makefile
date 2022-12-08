compile:
	npx hardhat compile
	npx hardhat run scripts/compile.ts
test:
	npx hardhat test
run-node:
	npx hardhat node
deploy-local:
	npx hardhat run scripts/deploy.ts --network localhost
update-local:
	npx hardhat run scripts/update.ts --network localhost
goerli:
	npx hardhat run scripts/old-deploy.ts --network goerli
deploy-goerli:
	npx hardhat run scripts/deploy.ts --network goerli
update-goerli:
	npx hardhat run scripts/update.ts --network goerli
scroll:
	npx hardhat run scripts/deploy.ts --network scroll
hardhat:
	npx hardhat node
