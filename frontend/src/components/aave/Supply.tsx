import { createPoolSlice } from "@components/aave/poolSlice";
import { Button } from "@components/Button";
import {
  getNormalizedBalance,
  getTokenContract,
  LINK_ADDRESS,
  TokenType,
  USDC_ADDRESS,
} from "@components/helpers/contractsHelper";
import contractAddress from "@contracts/contract-address.json";
import { Aave__factory } from "@contracts/typechain-types";
import { BigNumber, ethers, providers } from "ethers";
import React, { useEffect, useState } from "react";

export interface SupplyProps {
  account: string;
  provider: providers.Web3Provider;
}

export function Supply(props: SupplyProps) {
  const [contractUSDCBalance, setContractUSDCBalance] = useState<number>(0);
  const [supplyAmount, setSupplyAmount] = useState<number>(100);
  const [isSupplying, setIsSupplying] = useState(false);
  const [usdcThreshold, setUSDCThreshold] = useState(0);
  const [linkPrice, setLinkPrice] = useState(0);
  const [mintableLink, setMintableLink] = useState(0);
  const [topupLink, setTopUpLink] = useState(0);

  const handleSupply = (event) => {
    setSupplyAmount(event.target.value);
    calculateLinks();
  };

  function refreshPage() {
    window.location.reload();
  }

  const [userLINKBalance, setUserLINKBalance] = useState(0);

  async function updateUserLINKBalance() {
    const normalizedBalance = await getNormalizedBalance(
      props.provider,
      props.account,
      TokenType.LINK
    );
    setUserLINKBalance(normalizedBalance.toNumber());
  }

  async function getBalance() {
    const normalizedBalance = await getNormalizedBalance(
      props.provider,
      contractAddress.Aave,
      TokenType.USDC
    );
    setContractUSDCBalance(normalizedBalance.toNumber() || 0);
  }

  async function updateReserveInfo() {
    const { reservesHumanized } = await createPoolSlice(
      props.account,
      props.provider
    ).getPoolData();
    const usdcReserve = reservesHumanized.reservesData.find(
      (reserve) =>
        reserve.underlyingAsset.toLowerCase() === USDC_ADDRESS.toLowerCase()
    );
    if (usdcReserve) {
      setUSDCThreshold(parseInt(usdcReserve.reserveLiquidationThreshold) / 100);
    }
    const linkReserve = reservesHumanized.reservesData.find(
      (reserve) =>
        reserve.underlyingAsset.toLowerCase() === LINK_ADDRESS.toLowerCase()
    );
    if (linkReserve) {
      setLinkPrice(
        parseInt(linkReserve.priceInMarketReferenceCurrency) / 100000000
      );
    }
  }

  async function aaveSupply() {
    try {
      const signer = props.provider.getSigner();

      //Connect to contract
      const _aave = Aave__factory.connect(contractAddress.Aave, signer);
      setIsSupplying(true);

      const usdcContract = getTokenContract(props.provider, TokenType.USDC);
      await usdcContract.approve(
        contractAddress.Aave,
        BigNumber.from("10000000000"),
        { gasLimit: 15000000 }
      );
      const contractTransaction = await _aave.supply(supplyAmount, {
        gasLimit: 15000000,
      });
      await contractTransaction.wait();
      await getBalance();
      setIsSupplying(false);
    } catch (error) {
      console.log(error);
      setIsSupplying(false);
    }
  }

  function calculateLinks() {
    setMintableLink((supplyAmount * usdcThreshold) / (100 * linkPrice));
    setTopUpLink(
      Math.floor((supplyAmount * usdcThreshold) / (100 * linkPrice * 2))
    );
  }

  useEffect(() => {
    getBalance();
    updateUserLINKBalance();
    updateReserveInfo();
    calculateLinks();
  });

  return (
    <div className="bordered-container p-4">
      <p className="font-bold">Your amount will be topped your Link by 50%</p>
      {supplyAmount > contractUSDCBalance ? (
        <p className="text-orange-700	">
          Supply max upto USDC in present in contract (Upto{" "}
          {contractUSDCBalance} USDC)
        </p>
      ) : null}

      <div className="m-8">
        <div className="text-xl">Supply USDC and get LINK</div>
        <div className="md:flex md:items-center mb-6 mt-6">
          <div className="md:w-2/3">
            <input
              className="bg-gray-200 appearance-none border-2 border-gray-700 rounded w-full py-2 px-4 text-gray-700 leading-tight bg-gray-800 focus:outline-none focus:bg-gray-800 focus:border-blue-500"
              type="number"
              value={supplyAmount}
              onChange={handleSupply}
            />
          </div>
          <div className="md:w-1/3">
            <Button
              label={"Supply"}
              onClick={aaveSupply}
              loading={isSupplying}
              loadingText={"Supplying..."}
              disabled={supplyAmount > contractUSDCBalance}
            />
          </div>
        </div>
      </div>

      <div className="supply-table">
        <div className="table-row-group">
          <div className="supply-table-row">
            <div className="table-cell">Your Current LINK Balance</div>
            <div className="table-cell">{userLINKBalance}</div>
          </div>

          <div className="supply-table-row">
            <div className="table-cell">USDC Threshold</div>
            <div className="table-cell">{usdcThreshold}%</div>
          </div>
          <div className="supply-table-row">
            <div className="table-cell">USDC Threshold</div>
            <div className="table-cell">
              {((supplyAmount * usdcThreshold) / 100).toFixed(0)} USDC
            </div>
          </div>
          <div className="supply-table-row">
            <div className="table-cell">Link Price</div>
            <div className="table-cell">{linkPrice} USD</div>
          </div>
          <div className="supply-table-row">
            <div className="table-cell">Mintable Link (Your eligibility)</div>
            <div className="table-cell">{mintableLink.toFixed(0)} LINK</div>
          </div>
          <div className="supply-table-row text-green-700">
            <div className="table-cell ">TopUp Link (Added by contract)</div>
            <div className="table-cell">{topupLink} LINK</div>
          </div>
          <div className="supply-table-row text-green-700">
            <div className="table-cell ">Total Link to Mint</div>
            <div className="table-cell">
              {Math.round(mintableLink + topupLink)} LINK
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-evenly items-center mt-10">
        <p className="text-[#9e9589]">Don't see the updates?</p>
        <button onClick={refreshPage} className="btn btn-blue">
          <p className="text-gray-300">Reload!</p>
        </button>
      </div>
    </div>
  );
}
