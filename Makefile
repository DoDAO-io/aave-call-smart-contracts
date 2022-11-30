compile:
	npx hardhat compile
	npx hardhat run scripts/compile.ts
test:
	npx hardhat test
run-node:
	npx hardhat node
deploy:
	npx hardhat run scripts/deploy.ts --network localhost
goerli:
	npx hardhat run scripts/deploy.ts --network goerli
scroll:
	npx hardhat run scripts/deploy.ts --network scroll
hardhat:
	npx hardhat node
