import { createPoolSlice } from "@components/aave/poolSlice";
import { IERC20 } from "@contracts/typechain-types";
import React, { useEffect, useState } from "react";
import { BigNumber, ethers, providers } from "ethers";
import { IERC20__factory } from "@contracts/typechain-types/factories/@openzeppelin/contracts/token/ERC20/IERC20__factory";
import { submitTransaction } from "./../../utils/submitTransaction";
import contractAddress from "@contracts/contract-address.json";
export interface DepositUSDCProps {
  account: string;
  provider: providers.Web3Provider;
}

export function MintUSDC(props: DepositUSDCProps) {
  const tokenContract = IERC20__factory.connect(
    "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
    props.provider?.getSigner(0)
  );
  const mintOneUSDC = async () => {
    try {
      const poolSlice = createPoolSlice(props.account, props.provider);

      setIsMintingToUser(true);
      const mintResponse = await poolSlice.mint({
        reserve: "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
        tokenSymbol: "USDC",
        userAddress: props.account,
      });
      for (const tx of mintResponse) {
        await submitTransaction({ provider: props.provider, tx });
        await updateUserUSDCBalance();
        await updateUserLINKBalance();
        await updateContractBalance();
        setIsMintingToUser(false);
      }
    } catch (error) {
      console.log(error);
      setIsMintingToUser(false);
    }
  };

  const transferUSDCToContract = async () => {
    await setIsMintingToContract(true);
    try {
      const contractTransaction = await tokenContract.transfer(
        contractAddress.Aave,
        BigNumber.from("2000000000")
      );
      await contractTransaction.wait();
      await setIsMintingToContract(false);
      await updateContractBalance();
    } catch (e) {
      console.log(e);
      await setIsMintingToContract(false);
    }
  };
  const [userUSDCBalance, setUserUSDCBalance] = useState("0");
  const [userLINKBalance, setUserLINKBalance] = useState("0");
  const [contractBalance, setContractBalance] = useState("0");
  const [isMintingToUser, setIsMintingToUser] = useState(false);
  const [isMintingToContract, setIsMintingToContract] = useState(false);

  async function getNormalizedBalance(
    signerAddress: string,
    tokenAddress: string,
    decimal: string
  ) {
    //Connect to contract

    const userTokenBalance = await tokenContract.balanceOf(signerAddress);
    //Note that userTokenBalance is not a number and it is bigNumber
    const balance = userTokenBalance.toString();
    const normalizedBalance: string = BigNumber.from(balance)
      .div(BigNumber.from(decimal).toString())
      .toString();
    return normalizedBalance;
  }

  async function updateUserUSDCBalance() {
    const normalizedBalance = await getNormalizedBalance(
      props.account,
      "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
      "1000000"
    );
    setUserUSDCBalance(normalizedBalance);
  }

  async function updateUserLINKBalance() {
    const normalizedBalance = await getNormalizedBalance(
      props.account,
      "0x07C725d58437504CA5f814AE406e70E21C5e8e9e",
      "1000000000000000000"
    );
    setUserLINKBalance(normalizedBalance);
  }

  async function updateContractBalance() {
    const normalizedBalance = await getNormalizedBalance(
      contractAddress.Aave,
      "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
      "1000000"
    );
    setContractBalance(normalizedBalance);
  }

  useEffect(() => {
    updateUserUSDCBalance();
    updateUserLINKBalance();
    updateContractBalance();
  });

  return (
    <div>
      <div className="flex flex-row justify-between items-center m-4">
        <h1 className="text-[#9e9589] font-bold text-xl">
          Your USDC Balance: {userUSDCBalance}
        </h1>
        {isMintingToUser ? (
          <button className="btn btn-blue disabled flex flex-row justify-evenly items-center">
            <p className="text-gray-300">Minting...</p>
            <div
              className="w-6 h-6 rounded-full animate-spin
                    border-4 border-solid border-gray-300 border-t-transparent ml-5"
            ></div>
          </button>
        ) : (
          <button onClick={() => mintOneUSDC()} className="btn btn-blue">
            Mint 10K USDC
          </button>
        )}
      </div>
      <div className="flex justify-center">
        <h1 className="text-[#9e9589] font-bold text-xl">
          Your LINK Balance: {userLINKBalance}
        </h1>
      </div>
      <div className="flex flex-row justify-between items-center m-4">
        <h1 className="text-[#9e9589] font-bold text-xl">
          Contract Balance: {contractBalance}
        </h1>
        {isMintingToContract ? (
          <button className="btn btn-blue disabled flex flex-row justify-evenly items-center">
            <p className="text-gray-300">Transferring...</p>
            <div
              className="w-6 h-6 rounded-full animate-spin
                    border-4 border-solid border-gray-300 border-t-transparent ml-5"
            ></div>
          </button>
        ) : (
          <button
            onClick={() => transferUSDCToContract()}
            className="btn btn-blue"
          >
            <p className="text-gray-300">Transfer 2K USDC</p>
          </button>
        )}
      </div>
    </div>
  );
}
