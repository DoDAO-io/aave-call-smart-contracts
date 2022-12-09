import { EthereumTransactionTypeExtended } from "@aave/contract-helpers";
import { BigNumber, providers } from "ethers";

export interface SubmitTransactionParams {
  provider: providers.Web3Provider; // Signing transactions requires a wallet provider, Aave UI currently uses web3-react (https://github.com/NoahZinsmeister/web3-react) for connecting wallets and accessing the wallet provider
  tx: EthereumTransactionTypeExtended;
}

export async function submitTransaction({
  provider,
  tx,
}: SubmitTransactionParams) {
  const extendedTxData = await tx.tx();
  const { from, ...txData } = extendedTxData;
  const signer = provider.getSigner(from);
  const txResponse = await signer.sendTransaction({
    ...txData,
    value: txData.value ? BigNumber.from(txData.value) : undefined,
    gasLimit: 10000000,
  });
  await txResponse.wait();
  console.log("txResponse", txResponse);
  return txResponse;
}
