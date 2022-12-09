import { IERC20__factory } from "@contracts/typechain-types";
import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "ethers";

export const USDC_ADDRESS = "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43";

export const LINK_ADDRESS = "0x07C725d58437504CA5f814AE406e70E21C5e8e9e";

export enum TokenType {
  USDC = "USDC",
  LINK = "LINK",
}
export function getTokenContract(provider: JsonRpcProvider, tokenType: String) {
  return IERC20__factory.connect(
    tokenType === TokenType.USDC ? USDC_ADDRESS : LINK_ADDRESS,
    provider?.getSigner(0)!
  );
}

export async function getNormalizedBalance(
  provider: JsonRpcProvider,
  userAddress: string,
  tokenType: TokenType
): Promise<BigNumber> {
  //Connect to contract

  const tokenContract = getTokenContract(provider, tokenType);
  const userTokenBalance = await tokenContract.balanceOf(userAddress);
  //Note that userTokenBalance is not a number and it is bigNumber
  const normalizedBalance: BigNumber = userTokenBalance.div(
    BigNumber.from(
      tokenType === TokenType.USDC ? "1000000" : "1000000000000000000"
    ).toString()
  );
  return normalizedBalance;
}
