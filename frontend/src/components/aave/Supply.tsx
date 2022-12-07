import React, {useState} from "react";
import { BigNumber, ethers, providers } from "ethers";
import { Aave__factory } from "@contracts/typechain-types";
import { Aave } from "@contracts/typechain-types/contracts/Aave";
import contractAddress from "@contracts/contract-address.json";

export function Supply() {
    const [balance, setBalance] = useState('0');
    const [supplyAmount, setSupplyAmount] = useState(0);
    const [score, setScore] = useState(0);
    const [borrowAmount, setBorrowAmount] = useState(0);

    const handleSupply = (event) => {
        setSupplyAmount(event.target.value);
        // console.log(supplyAmount);
    }

    const handleScore = (event) => {
        setScore(event.target.value);
    }

    const handleBorrow = (event) => {
        setBorrowAmount(event.target.value);
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
        const tokenContract = new ethers.Contract('0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43' , tokenABI , signer);
        const userTokenBalance = await tokenContract.balanceOf(signerAddress);
        //Note that userTokenBalance is not a number and it is bigNumber
        const balance = userTokenBalance.toString();
        // const balance = userTokenBalance.toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
        // const userbalance = BigNumber.from(userTokenBalance);
        setBalance(balance);
        console.log(balance);
    }
  async function aaveSupply() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //Get connected wallet address
    const signerAddress = await signer.getAddress();
    //Connect to contract
    const _aave = Aave__factory.connect(
        contractAddress.Aave,
        signer
      );
    console.log(_aave);
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
    const contractTransaction = await _aave.supply({ gasLimit: 15000000 });
    await contractTransaction.wait();
    console.log(contractTransaction);
    getBalance();
}

  return (
    <div className="m-8">
        <p className="text-gray-500 font-bold">
            We will add to the amount you supply based on your credit score.
        </p>
        <p className="text-gray-500 font-bold text-xl">
            Available USDC: {balance}
        </p>
        <div className="md:flex md:items-center mb-6 mt-6">
            <div className="md:w-1/3">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                Supply Amount
            </label>
            </div>
            <div className="md:w-2/3">
            <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="number" value={supplyAmount} onChange={handleSupply} />
            </div>
        </div>
        <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                Credit Score (0-100)
            </label>
            </div>
            <div className="md:w-2/3">
            <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="number" value={score} onChange={handleScore}/>
            </div>
        </div>
        <button onClick={() => aaveSupply()} className="btn btn-blue">
            Supply
        </button>
        <div className="md:flex md:items-center mb-6 mt-6">
            <div className="md:w-1/3">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                Borrow Amount
            </label>
            </div>
            <div className="md:w-2/3">
            <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" type="number" value={borrowAmount} onChange={handleBorrow}/>
            </div>
        </div>
        <button onClick={() => aaveSupply()} className="btn btn-blue">
            Borrow
        </button>
        
    </div>
  );
}