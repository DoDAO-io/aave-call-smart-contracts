import { createPoolSlice } from "@components/aave/poolSlice";
import React, { useEffect, useState } from "react";
import { BigNumber, ethers, providers } from "ethers";
import { submitTransaction } from "./../../utils/submitTransaction";
import contractAddress from "@contracts/contract-address.json";
export interface DepositUSDCProps {
  account: string;
  provider: providers.Web3Provider;
}

export function MintUSDC(props: DepositUSDCProps) {
  const mintOneUSDC = async () => {
    try {
        const poolSlice = createPoolSlice(props.account, props.provider);

        const poolData = await poolSlice.getPoolData();
        console.log("poolData", poolData);
        setIsLoading(true);
        const mintResponse = await poolSlice.mint({
        reserve: "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
        tokenSymbol: "USDC",
        userAddress: contractAddress.Aave,
        });
        for (const tx of mintResponse) {
            await submitTransaction({ provider: props.provider, tx });
            getBalance();
            setIsLoading(false);
        }
    } catch (error) {
        console.log(error);
        setIsLoading(false);
    }
  };
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  const tokenABI = [
    // balanceOf
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
  ];
  async function getBalance() {
    const signer = props.provider.getSigner();
    //Get connected wallet address
    const signerAddress = await signer.getAddress();
    //Connect to contract
    const tokenContract = new ethers.Contract(
      "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
      tokenABI,
      signer
    );
    const userTokenBalance = await tokenContract.balanceOf(signerAddress);
    //Note that userTokenBalance is not a number and it is bigNumber
    const balance = userTokenBalance.toString();
    const normalizedBalance: string = BigNumber.from(balance)
      .div(BigNumber.from("1000000").toString())
      .toString();
    setBalance(normalizedBalance);
    console.log(balance);
  }

  useEffect(() => {
    getBalance();
  });

  return (
    <div className="flex flex-row justify-evenly items-center">
      <h1 className="text-gray-500 font-bold text-xl">
        Your USDC Balance:  {balance}
      </h1>
      {isLoading ? (
            <button className="btn btn-blue disabled flex flex-row justify-evenly items-center">
                <div className="w-6 h-6 rounded-full animate-spin
                    border-4 border-solid border-white-500 border-t-transparent mr-5">
                </div>
                <p>Minting...</p> 
            </button>
        ) : (
            <button onClick={() => mintOneUSDC()} className="btn btn-blue">
                Mint 10K USDC
            </button>
        )}
    </div>
  );
}
