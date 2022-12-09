import React, { useEffect, useState } from "react";
import { BigNumber, ethers, providers } from "ethers";
import { Aave__factory } from "@contracts/typechain-types";
import { Aave } from "@contracts/typechain-types/contracts/Aave";
import contractAddress from "@contracts/contract-address.json";

export function Supply() {
  const [balance, setBalance] = useState("0");
  const [supplyAmount, setSupplyAmount] = useState(0);
  const [score, setScore] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [isSupplying, setIsSupplying] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);

  const handleSupply = (event) => {
    setSupplyAmount(event.target.value);
    // console.log(supplyAmount);
  };

  const handleScore = (event) => {
    setScore(event.target.value);
  };

  const handleBorrow = (event) => {
    setBorrowAmount(event.target.value);
  };

  function refreshPage() {
    window.location.reload();
  }

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
    const signerAddress = contractAddress.Aave;
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
  async function aaveSupply() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      //Get connected wallet address
      const signerAddress = await signer.getAddress();
      //Connect to contract
      const _aave = Aave__factory.connect(contractAddress.Aave, signer);
      console.log(_aave);
      setIsSupplying(true);
      let abi = [
        "function approve(address _spender, uint256 _value) public returns (bool success)",
      ];

      let contract = new ethers.Contract(
        "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
        abi,
        provider?.getSigner(0)
      );
      await contract.approve(
        contractAddress.Aave,
        BigNumber.from("10000000000"),
        { gasLimit: 15000000 }
      );
      const contractTransaction = await _aave.supply(800, {
        gasLimit: 15000000,
      });
      await contractTransaction.wait();
      setIsSupplying(false);
      console.log(contractTransaction);
      getBalance();
    } catch (error) {
      console.log(error);
      setIsSupplying(false);
    }
  }

  useEffect(() => {
    getBalance();
  });

  return (
    <div className="m-8">
      <p className="text-[#9e9589] font-bold">
        We will add to the amount you supply based on your credit score.
      </p>
      <p className="text-[#9e9589] font-bold text-xl">
        Available USDC: {balance}
      </p>
      <div className="md:flex md:items-center mb-6 mt-6">
        <div className="md:w-1/3">
          <label className="block text-[#9e9589] font-bold md:text-right mb-1 md:mb-0 pr-4">
            Supply Amount
          </label>
        </div>
        <div className="md:w-2/3">
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-700 rounded w-full py-2 px-4 text-gray-700 leading-tight bg-gray-800 focus:outline-none focus:bg-gray-800 focus:border-blue-500"
            type="number"
            value={supplyAmount}
            onChange={handleSupply}
          />
        </div>
      </div>
      <div className="md:flex md:items-center mb-6">
        <div className="md:w-1/3">
          <label className="block text-[#9e9589] font-bold md:text-right mb-1 md:mb-0 pr-4">
            Credit Score (0-100)
          </label>
        </div>
        <div className="md:w-2/3">
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-700 rounded w-full py-2 px-4 text-gray-700 leading-tight bg-gray-800 focus:outline-none focus:bg-gray-800 focus:border-blue-500"
            type="number"
            value={score}
            onChange={handleScore}
          />
        </div>
      </div>
      <div className="flex justify-center">
        {isSupplying ? (
          <button className="btn btn-blue disabled flex flex-row justify-evenly">
            <p className="text-gray-300">Supplying...</p>
            <div
              className="w-6 h-6 rounded-full animate-spin
                    border-4 border-solid border-gray-300 border-t-transparent ml-5"
            ></div>
          </button>
        ) : (
          <button onClick={() => aaveSupply()} className="btn btn-blue">
            <p className="text-gray-300">Supply</p>
          </button>
        )}
      </div>
      <div className="md:flex md:items-center mb-6 mt-6">
        <div className="md:w-1/3">
          <label className="block text-[#9e9589] font-bold md:text-right mb-1 md:mb-0 pr-4">
            Borrow Amount
          </label>
        </div>
        <div className="md:w-2/3">
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-700 rounded w-full py-2 px-4 text-gray-700 leading-tight bg-gray-800 focus:outline-none focus:bg-gray-800 focus:border-blue-500"
            type="number"
            value={borrowAmount}
            onChange={handleBorrow}
          />
        </div>
      </div>
      <div className="flex justify-center">
        {isBorrowing ? (
          <button className="btn btn-blue disabled flex flex-row justify-evenly">
            <p className="text-gray-300">Borrowing...</p>
            <div
              className="w-6 h-6 rounded-full animate-spin
                    border-4 border-solid border-gray-300 border-t-transparent ml-5"
            ></div>
          </button>
        ) : (
          <button onClick={() => aaveSupply()} className="btn btn-blue">
            <p className="text-gray-300">Borrow</p>
          </button>
        )}
      </div>
      <div className="flex flex-row justify-evenly items-center m-10">
        <p className="text-[#9e9589]">Don't see the updates?</p>
        <button onClick={refreshPage} className="btn btn-blue">
          <p className="text-gray-300">Reload!</p>
        </button>
      </div>
    </div>
  );
}
