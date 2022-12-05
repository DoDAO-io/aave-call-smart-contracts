import {
  FaucetService,
  InterestRate,
  LendingPool,
  Pool,
  UiPoolDataProvider,
} from "@aave/contract-helpers";
import {
  LPBorrowParamsType,
  LPSetUsageAsCollateral,
  LPSwapBorrowRateMode,
  LPWithdrawParamsType,
} from "@aave/contract-helpers/dist/esm/lendingPool-contract/lendingPoolTypes";
import { FaucetParamsType } from "@aave/contract-helpers/src/faucet-contract";
import { Provider } from "@ethersproject/providers";

export enum ChainId {
  mainnet = 1,
  ropsten = 3,
  rinkeby = 4,
  goerli = 5,
  kovan = 42,
  xdai = 100,
  polygon = 137,
  mumbai = 80001,
  avalanche = 43114,
  fuji = 43113, // avalanche test network
  arbitrum_one = 42161,
  arbitrum_rinkeby = 421611,
  fantom = 250,
  fantom_testnet = 4002,
  optimism = 10,
  optimism_kovan = 69,
  harmony = 1666600000,
  harmony_testnet = 1666700000,
}

const marketInfo = {
  marketTitle: "Ethereum Görli",
  v3: true,
  chainId: ChainId.goerli,
  enabledFeatures: {
    // Note: We should remove this based on the addresses that you provide in the addresses below
    faucet: true,
    // governance: true,
    // staking: true,
    // incentives: true,
  },
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER:
      "0xc4dCB5126a3AfEd129BC3668Ea19285A9f56D15D".toLowerCase(),
    LENDING_POOL: "0x368EedF3f56ad10b9bC57eed4Dac65B26Bb667f6",
    WETH_GATEWAY: "0xd5B55D3Ed89FDa19124ceB5baB620328287b915d",
    FAUCET: "0x1ca525Cd5Cb77DB5Fa9cBbA02A0824e283469DBe",
    WALLET_BALANCE_PROVIDER: "0x75CC0f0E3764be7594772D08EEBc322970CbB3a9",
    UI_POOL_DATA_PROVIDER: "0xC576539371a2f425545B7BF4eb2a14Eee1944a1C",
    UI_INCENTIVE_DATA_PROVIDER: "0xACFd610B51ac6B70F030B277EA8A2A8D2143dC7A",
  },
};
export interface SupplyActionProps {
  amountToSupply: string;
  poolReserve: any;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
}

export const createPoolSlice = (account: string, provider: Provider) => {
  const user = account;
  const userAddress = account;

  function getCorrectPool() {
    if (marketInfo.v3) {
      return new Pool(provider, {
        POOL: marketInfo.addresses.LENDING_POOL,
      });
    } else {
      return new LendingPool(provider, {
        LENDING_POOL: marketInfo.addresses.LENDING_POOL,
      });
    }
  }
  return {
    data: new Map(),
    getPoolData: async () => {
      const currentChainId: number = marketInfo.chainId;
      const poolDataProviderContract = new UiPoolDataProvider({
        uiPoolDataProviderAddress: marketInfo.addresses.UI_POOL_DATA_PROVIDER,
        provider: provider,
        chainId: currentChainId,
      });
      const lendingPoolAddressProvider =
        marketInfo.addresses.LENDING_POOL_ADDRESS_PROVIDER;

      const reservesHumanized =
        await poolDataProviderContract.getReservesHumanized({
          lendingPoolAddressProvider,
        });
      const userReservesHumanized =
        await poolDataProviderContract.getUserReservesHumanized({
          lendingPoolAddressProvider,
          user: account,
        });

      return { reservesHumanized, userReservesHumanized };
    },

    mint: async (args: FaucetParamsType) => {
      const service = new FaucetService(provider, marketInfo.addresses.FAUCET);
      return service.mint({ ...args, userAddress });
    },
    withdraw: (args: LPWithdrawParamsType) => {
      const pool = getCorrectPool();
      return pool.withdraw({
        ...args,
        user,
      });
    },
    borrow: async (args: LPBorrowParamsType) => {
      const pool = getCorrectPool();

      return pool.borrow({
        ...args,
        user,
      });
    },
    setUsageAsCollateral: async (args: LPSetUsageAsCollateral) => {
      const pool = getCorrectPool();
      return pool.setUsageAsCollateral({
        ...args,
        user,
      });
    },
    swapBorrowRateMode: async (args: LPSwapBorrowRateMode) => {
      const pool = getCorrectPool();
      return pool.swapBorrowRateMode({
        ...args,
        user,
      });
    },

    repay: ({ repayWithATokens, amountToRepay, poolAddress, debtType }) => {
      const pool = getCorrectPool();
      const currentAccount = account;
      if (pool instanceof Pool && repayWithATokens) {
        return pool.repayWithATokens({
          user: currentAccount,
          reserve: poolAddress,
          amount: amountToRepay,
          rateMode: debtType as InterestRate,
        });
      } else {
        return pool.repay({
          user: currentAccount,
          reserve: poolAddress,
          amount: amountToRepay,
          interestRateMode: debtType,
        });
      }
    },
    repayWithPermit: ({
      poolAddress,
      amountToRepay,
      debtType,
      deadline,
      signature,
    }) => {
      // Better to get rid of direct assert
      const pool = getCorrectPool() as Pool;
      return pool.repayWithPermit({
        user,
        reserve: poolAddress,
        amount: amountToRepay, // amountToRepay.toString(),
        interestRateMode: debtType,
        signature,
        deadline,
      });
    },
    supply: ({ poolAddress, amountToSupply }) => {
      const pool = getCorrectPool();
      const currentAccount = account;
      if (pool instanceof Pool) {
        return pool.supply({
          user: currentAccount,
          reserve: poolAddress,
          amount: amountToSupply,
        });
      } else {
        const lendingPool = pool as LendingPool;
        return lendingPool.deposit({
          user: currentAccount,
          reserve: poolAddress,
          amount: amountToSupply,
        });
      }
    },
    supplyWithPermit: (args) => {
      const pool = getCorrectPool() as Pool;
      return pool.supplyWithPermit({
        ...args,
        user,
      });
    },

    setUserEMode: async (categoryId) => {
      const pool = getCorrectPool() as Pool;
      return pool.setUserEMode({
        user,
        categoryId,
      });
    },
    signERC20Approval: async (args) => {
      const pool = getCorrectPool() as Pool;
      return pool.signERC20Approval({
        ...args,
        user,
      });
    },
  };
};

// TODO: move somewhere else
