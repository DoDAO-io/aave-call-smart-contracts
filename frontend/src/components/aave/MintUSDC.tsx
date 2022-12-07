import { createPoolSlice } from "@components/aave/poolSlice";
import React, {useState} from "react";
import {BigNumber, ethers, providers} from "ethers";
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
      getBalance();
    }
  };
//   const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0));
  const [balance, setBalance] = useState('0');

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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //Get connected wallet address
    const signerAddress = await signer.getAddress();
    //Connect to contract
    const tokenContract = await new ethers.Contract('0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43' , tokenABI , signer);
    const userTokenBalance = await tokenContract.balanceOf(signerAddress);
    //Note that userTokenBalance is not a number and it is bigNumber
    const balance = userTokenBalance.toString();
    // const balance = userTokenBalance.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
    // const userbalance = BigNumber.from(userTokenBalance);
    setBalance(balance);
    console.log(balance);
}

getBalance();

  return (
    <div className="flex flex-row justify-evenly items-center">
        <h1 className="text-gray-500 font-bold text-xl">
            Your Balance: 
            {balance}  
        </h1>
        <button onClick={() => mintOneUSDC()} className="btn btn-blue">
            Mint 10K USDC
        </button>
    </div>
  );
}
