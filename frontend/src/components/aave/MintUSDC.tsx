import { createPoolSlice } from "@components/aave/poolSlice";
import { Button } from "@components/Button";
import {
  getNormalizedBalance,
  getTokenContract,
  TokenType,
  USDC_ADDRESS,
} from "@components/helpers/contractsHelper";
import contractAddress from "@contracts/contract-address.json";
import { BigNumber, providers } from "ethers";
import React, { useEffect, useState } from "react";
import { submitTransaction } from "./../../utils/submitTransaction";

export interface DepositUSDCProps {
  account: string;
  provider: providers.Web3Provider;
}

export function MintUSDC(props: DepositUSDCProps) {
  const usdcTokenContract = getTokenContract(props.provider, TokenType.USDC);
  const mintOneUSDC = async () => {
    try {
      const poolSlice = createPoolSlice(props.account, props.provider);

      setIsMintingToUser(true);
      const mintResponse = await poolSlice.mint({
        reserve: USDC_ADDRESS,
        tokenSymbol: "USDC",
        userAddress: props.account,
      });
      for (const tx of mintResponse) {
        await submitTransaction({ provider: props.provider, tx });
        await updateUserUSDCBalance();
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
      const contractTransaction = await usdcTokenContract.transfer(
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
  const [userUSDCBalance, setUserUSDCBalance] = useState(0);

  const [contractBalance, setContractBalance] = useState(0);
  const [isMintingToUser, setIsMintingToUser] = useState(false);
  const [isMintingToContract, setIsMintingToContract] = useState(false);

  async function updateUserUSDCBalance() {
    const normalizedBalance = await getNormalizedBalance(
      props.provider,
      props.account,
      TokenType.USDC
    );
    setUserUSDCBalance(normalizedBalance.toNumber());
  }

  async function updateContractBalance() {
    const normalizedBalance = await getNormalizedBalance(
      props.provider,
      contractAddress.Aave,
      TokenType.USDC
    );
    setContractBalance(normalizedBalance.toNumber());
  }

  useEffect(() => {
    updateUserUSDCBalance();
    updateContractBalance();
  });

  return (
    <div className="bordered-container">
      <div className="flex flex-row justify-between items-center m-4">
        <h1>Your USDC Balance: {userUSDCBalance}</h1>
        <Button
          label={"Mint 10K USDC"}
          onClick={mintOneUSDC}
          loading={isMintingToUser}
          loadingText={"Minting..."}
        />
      </div>

      <div className="flex flex-row justify-between items-center m-4">
        <h1>Contract Balance: {contractBalance}</h1>
        <Button
          label={"Transfer 2K USDC"}
          onClick={transferUSDCToContract}
          loading={isMintingToContract}
          loadingText={"Transferring..."}
        />
      </div>
    </div>
  );
}
