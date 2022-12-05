import { EthereumTransactionTypeExtended } from "@aave/contract-helpers";
import { createPoolSlice } from "@components/aave/poolSlice";
import React from "react";

import { BigNumber, providers } from "ethers";

export interface DepositUSDCProps {
  account: string;
  provider: providers.Web3Provider;
}

interface SubmitTransactionParams {
  provider: providers.Web3Provider; // Signing transactions requires a wallet provider, Aave UI currently uses web3-react (https://github.com/NoahZinsmeister/web3-react) for connecting wallets and accessing the wallet provider
  tx: EthereumTransactionTypeExtended;
}

export function DepositUSDC(props: DepositUSDCProps) {
  const submitTransaction = async ({
    provider,
    tx,
  }: SubmitTransactionParams) => {
    const extendedTxData = await tx.tx();
    const { from, ...txData } = extendedTxData;
    const signer = provider.getSigner(from);
    const txResponse = await signer.sendTransaction({
      ...txData,
      value: txData.value ? BigNumber.from(txData.value) : undefined,
      gasLimit: 10000000,
    });
  };
  const depositOneUSDC = async () => {
    const poolSlice = createPoolSlice(props.account, props.provider);

    const poolData = await poolSlice.getPoolData();
    console.log("poolData", poolData);
    const mintResponse = await poolSlice.mint({
      reserve: "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
      tokenSymbol: "USDC",
      userAddress: props.account,
    });
    for (const tx of mintResponse) {
      await submitTransaction({ provider: props.provider, tx });
    }

    const result = await poolSlice.supply({
      poolAddress: "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
      amountToSupply: parseFloat("1"),
    });
    console.log(result);
    for (const tx of result) {
      await submitTransaction({ provider: props.provider, tx });
    }
  };
  return (
    <button onClick={() => depositOneUSDC()} className="btn btn-blue">
      Deposit 1 USDC
    </button>
  );
}
