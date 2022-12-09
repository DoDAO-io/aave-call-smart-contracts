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

contract Aave {

    // Storage Variables
    address public borrowTokenAddress = 0x07C725d58437504CA5f814AE406e70E21C5e8e9e;
    address public supplyTokenAddress = 0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43;
    address public aavePoolAddress = 0x368EedF3f56ad10b9bC57eed4Dac65B26Bb667f6;
    address public dataProviderAddress = 0x9BE876c6DC42215B00d7efe892E2691C3bc35d10;
    address public aaveOracleAddress = 0x5bed0810073cc9f0DacF73C648202249E87eF6cB;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;


    function supply(uint _userAmount, uint healthScore) public returns (bool) {

        uint _total = _userAmount + _userAmount * ((healthScore * 20) / 10000);

        // 1. Transfer _useramount from user to contract
        IERC20(supplyTokenAddress).transferFrom(msg.sender, address(this), _userAmount * 1000000);

        IERC20(supplyTokenAddress).approve(aavePoolAddress, _total * 1000000);


        DataTypes.ReserveData memory reserveData = IPool(aavePoolAddress).getReserveData(supplyTokenAddress);

        emit AssetPrice("USDC", IPriceOracleGetter(aaveOracleAddress).getAssetPrice(supplyTokenAddress));
        emit AssetPrice("LINK", IPriceOracleGetter(aaveOracleAddress).getAssetPrice(borrowTokenAddress));

        uint256 linkPrice = IPriceOracleGetter(aaveOracleAddress).getAssetPrice(borrowTokenAddress);
        uint256 linkPriceInUSDC = linkPrice / 100000000;


        uint256 threshold = reserveData.configuration.getLiquidationThreshold();

        emit FoundThreshold(threshold);

        // 3. Supply _total to Aave pool
        IPool(aavePoolAddress).supply(supplyTokenAddress, _total * 1000000, address(this), 0);


        IPool(aavePoolAddress).borrow(borrowTokenAddress, (_total / linkPriceInUSDC) * 1 ether, 2, 0, msg.sender);


        return true;
    }

    function borrow() public returns (bool) {
        // Borrow 0.3 DAI to contract
        IPool(aavePoolAddress).borrow(borrowTokenAddress, 0.3 ether, 2, 0, address(this));

        // Transfer DAI to user
        IERC20(borrowTokenAddress).transferFrom(address(this), msg.sender, 0.3 ether);

        return true;
    }

    event FoundThreshold(uint256 threshold);
    event FoundTotal(uint256 total);
    event FoundPrice(uint256 total);
    event AssetPrice(string asset, uint256 total);
}
