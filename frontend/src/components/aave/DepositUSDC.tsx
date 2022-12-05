import { createPoolSlice } from "@components/aave/poolSlice";
import { TransactionResponses } from "@components/aave/TransactionResponses";
import { TransactionResponse } from "@ethersproject/providers";
import { providers } from "ethers";
import React, { useState } from "react";
import { submitTransaction } from "./../../utils/submitTransaction";

export interface DepositUSDCProps {
  account: string;
  provider: providers.Web3Provider;
}

export function DepositUSDC(props: DepositUSDCProps) {
  const [transactionResponses, setTransactionResponses] = useState<string[]>(
    []
  );

  const depositOneUSDC = async () => {
    const poolSlice = createPoolSlice(props.account, props.provider);

    const result = await poolSlice.supply({
      poolAddress: "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
      amountToSupply: parseFloat("1"),
    });
    console.log(result);
    const localResponses: TransactionResponse[] = [];
    for (const tx of result) {
      const response = await submitTransaction({
        provider: props.provider,
        tx,
      });
      localResponses.push(response);
    }
    setTransactionResponses(localResponses.map((t) => t.hash));
  };

  return (
    <div>
      <div>
        <button onClick={() => depositOneUSDC()} className="btn btn-blue">
          Deposit 1 USDC
        </button>
      </div>
      <TransactionResponses transactionHashes={transactionResponses} />
    </div>
  );
}
