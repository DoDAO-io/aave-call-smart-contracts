import { createPoolSlice } from "@components/aave/poolSlice";
import { providers } from "ethers";
import React from "react";
import { submitTransaction } from "./../../utils/submitTransaction";
import contractAddress from "@contracts/contract-address.json";
export interface DepositUSDCProps {
  account: string;
  provider: providers.Web3Provider;
}

export function MintUSDC(props: DepositUSDCProps) {
  const mintOneUSDC = async () => {
    const poolSlice = createPoolSlice(props.account, props.provider);

    const poolData = await poolSlice.getPoolData();
    console.log("poolData", poolData);
    const mintResponse = await poolSlice.mint({
      reserve: "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
      tokenSymbol: "USDC",
      userAddress: contractAddress.Aave,
    });
    for (const tx of mintResponse) {
      await submitTransaction({ provider: props.provider, tx });
    }
  };
  return (
    <button onClick={() => mintOneUSDC()} className="btn btn-blue">
      Mint 1 USDC
    </button>
  );
}
