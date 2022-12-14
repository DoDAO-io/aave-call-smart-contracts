import { MintUSDC } from "@components/aave/MintUSDC";
import contractAddress from "@contracts/contract-address.json";
import { IERC20__factory } from "@contracts/typechain-types/factories/@openzeppelin/contracts/token/ERC20/IERC20__factory";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import { Aave__factory } from "@contracts/typechain-types";
import { Aave } from "@contracts/typechain-types/contracts/Aave";
import { JsonRpcProvider } from "@ethersproject/providers";

// We'll use ethers to interact with the Ethereum network and our contract
import { BigNumber, ethers, providers } from "ethers";
import React from "react";
import { Supply } from "./aave/Supply";
import { ConnectWallet } from "./ConnectWallet";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { TransactionErrorMessage } from "./TransactionErrorMessage";

import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";

declare global {
  interface Window {
    ethereum: any;
  }
}

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
interface DappState {
  // The info of the token (i.e. It's Name and symbol)
  tokenData?: {
    name: string;
    symbol: string;
  };
  // The user's address and balance
  selectedAddress?: string;
  balance?: any;
  // The ID about transactions being sent, and any possible error with them
  txBeingSent?: string;
  transactionError?: any;
  networkError?: string;
  usdcBalance?: any;
}

// transaction.
export class Dapp extends React.Component<{}, DappState> {
  private _provider?: JsonRpcProvider;
  private initialState?: DappState;
  private _aave: Aave;
  private _pollDataInterval?: any;
  constructor(props: any) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      usdcBalance: undefined,
    };

    this.state = this.initialState;

    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    this._provider.resetEventsBlock(0);

    this._aave = Aave__factory.connect(
      contractAddress.Aave,
      this._provider.getSigner(0)
    );
  }

  async aaveSupply() {
    console.log(this._aave);

    let contract = IERC20__factory.connect(
      "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43",
      this._provider?.getSigner(0)!
    );
    await contract.approve(
      contractAddress.Aave,
      BigNumber.from("10000000000"),
      { gasLimit: 15000000 }
    );
    const contractTransaction = await this._aave.supply(800, {
      gasLimit: 15000000,
    });
    console.log(contractTransaction);
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // If everything is loaded, we render the application.
    return (
      <div>
        <div className="bordered-container m-8">
          <div className="m-4 flex justify-between">
            <div>Welcome!:</div> <div> {this.state.selectedAddress!}</div>
          </div>
          <div className="m-4 flex justify-between">
            <div>Contract Address:</div> <div>{contractAddress.Aave}</div>
          </div>
        </div>
        <div className="m-8">
          <MintUSDC
            account={this.state.selectedAddress!}
            provider={this._provider as providers.Web3Provider}
          />
        </div>

        <div className="m-8">
          <Supply
            account={this.state.selectedAddress!}
            provider={this._provider as providers.Web3Provider}
          />
        </div>

        <div className="row">
          <div className="col-12">
            {/* 
              Sending a transaction isn't an immediate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
            {this.state.txBeingSent && (
              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
            )}

            {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  componentDidMount() {
    try {
      this._connectWallet();
    } catch (e) {}
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]: any) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on("chainChanged", ([networkId]: any) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress: any) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.
  }
  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  // The next two methods just read from the contract and store the results
  // in the component state.

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error: any) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState!);
  }

  // This method checks if Metamask selected network is Localhost:8545
  _checkNetwork() {
    // if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
    //   return true;
    // }
    //
    this.setState({
      networkError: "Please connect Metamask to Localhost:8545",
    });

    return true;
  }
}
