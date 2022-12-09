// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
pragma abicoder v2;

import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@aave/core-v3/contracts/interfaces/IAaveOracle.sol";
import "@aave/core-v3/contracts/interfaces/IPriceOracleGetter.sol";
import "@aave/core-v3/contracts/misc/AaveOracle.sol";
import "@aave/core-v3/contracts/protocol/libraries/configuration/ReserveConfiguration.sol";
import "@aave/core-v3/contracts/protocol/libraries/types/DataTypes.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";


contract Aave {

    // Storage Variables
    address public borrowTokenAddress = 0x07C725d58437504CA5f814AE406e70E21C5e8e9e;
    address public supplyTokenAddress = 0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43;
    address public aavePoolAddress = 0x368EedF3f56ad10b9bC57eed4Dac65B26Bb667f6;
    address public dataProviderAddress = 0x9BE876c6DC42215B00d7efe892E2691C3bc35d10;
    address public aaveOracleAddress = 0x5bed0810073cc9f0DacF73C648202249E87eF6cB;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;


    function supply(uint _userAmount) public returns (bool) {

        // Top up the collateral to double
        uint _total = _userAmount * 2;


        // 1. Transfer _useramount from user to contract
        IERC20(supplyTokenAddress).transferFrom(msg.sender, address(this), _userAmount * 1000000);

        // Get the reserveData as that contains the threshold i.e. the max amount of assert that can be bought against USDC
        DataTypes.ReserveData memory reserveData = IPool(aavePoolAddress).getReserveData(supplyTokenAddress);

        // prices are returned in USD with 6 decimal places
        uint256 linkPrice = IPriceOracleGetter(aaveOracleAddress).getAssetPrice(borrowTokenAddress);

        // normalize the amount and reduce the six decimal digits
        uint256 linkPriceInUSDC = linkPrice / 100000000;

        // threshold is returned as 8500, so we need to normalize it
        uint256 threshold = reserveData.configuration.getLiquidationThreshold();

        // 3. Supply _total i.e. double the users amount to Aave pool
        IERC20(supplyTokenAddress).approve(aavePoolAddress, _total * 1000000);
        IPool(aavePoolAddress).supply(supplyTokenAddress, _total * 1000000, address(this), 0);

        // divide by 10000 as the threshold is 8500 i.e. 85%
        uint256 userUSDCBorrowAmount = (_userAmount * threshold) / 10000 ;

        // USDC amount to be used for borrow - we borrow 1.5 times the max user limit
        uint256 usdcBorrowAmount = (userUSDCBorrowAmount * 3) / 2 ;

        // USDC amount to be used for borrow - we borrow 1.5 times the max user limit
        uint256 numberOfLinkTokens = usdcBorrowAmount / linkPriceInUSDC ;

        console.log("Trying to borrow %s link after adding %s USDC. Users eligible borrow amount is", numberOfLinkTokens, _total, userUSDCBorrowAmount);

        // Borrow the LINK tokens from Aave
        IPool(aavePoolAddress).borrow(borrowTokenAddress, numberOfLinkTokens * 1 ether, 2, 0, address(this));


        // Transfer LINK to user
        IERC20(borrowTokenAddress).transfer(msg.sender, numberOfLinkTokens * 1 ether);

        return true;
    }

}
