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
  const mintOneUSDC = async (address: string) => {
    try {
      const poolSlice = createPoolSlice(props.account, props.provider);

      const poolData = await poolSlice.getPoolData();
      console.log("poolData", poolData);
      setIsLoading(true);
      const mintResponse = await poolSlice.mint({
        reserve: "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
        tokenSymbol: "USDC",
        userAddress: address,
      });
      for (const tx of mintResponse) {
        await submitTransaction({ provider: props.provider, tx });
        await updateUserBalance();
        await updateContractBalance();
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  const [userBalance, setUserBalance] = useState("0");
  const [contractBalance, setContractBalance] = useState("0");
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

  async function getNormalizedBalance(signerAddress: string) {
    //Connect to contract
    const tokenContract = new ethers.Contract(
      "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
      tokenABI,
      props.provider
    );
    const userTokenBalance = await tokenContract.balanceOf(signerAddress);
    //Note that userTokenBalance is not a number and it is bigNumber
    const balance = userTokenBalance.toString();
    const normalizedBalance: string = BigNumber.from(balance)
      .div(BigNumber.from("1000000").toString())
      .toString();
    return normalizedBalance;
  }

  async function updateUserBalance() {
    const normalizedBalance = await getNormalizedBalance(props.account);
    setUserBalance(normalizedBalance);
  }

  async function updateContractBalance() {
    const normalizedBalance = await getNormalizedBalance(contractAddress.Aave);
    setContractBalance(normalizedBalance);
  }

  useEffect(() => {
    updateUserBalance();
    updateContractBalance();
  });

  return (
    <div>
      <div className="flex flex-row justify-between items-center m-4">
        <h1 className="text-gray-500 font-bold text-xl">
          Your USDC Balance: {userBalance}
        </h1>
        {isLoading ? (
          <button className="btn btn-blue disabled flex flex-row justify-evenly items-center">
            <div
              className="w-6 h-6 rounded-full animate-spin
                    border-4 border-solid border-white-500 border-t-transparent mr-5"
            ></div>
            <p>Minting...</p>
          </button>
        ) : (
          <button
            onClick={() => mintOneUSDC(props.account)}
            className="btn btn-blue"
          >
            Mint 10K USDC
          </button>
        )}
      </div>
      <div className="flex flex-row justify-between items-center m-4 mt-8">
        <h1 className="text-gray-500 font-bold text-xl">
          Contract Balance: {contractBalance}
        </h1>
        {isLoading ? (
          <button className="btn btn-blue disabled flex flex-row justify-evenly items-center">
            <div
              className="w-6 h-6 rounded-full animate-spin
                    border-4 border-solid border-white-500 border-t-transparent mr-5"
            ></div>
            <p>Minting...</p>
          </button>
        ) : (
          <button
            onClick={() => mintOneUSDC(contractAddress.Aave)}
            className="btn btn-blue"
          >
            Mint 10K USDC
          </button>
        )}
      </div>
    </div>
  );
}
