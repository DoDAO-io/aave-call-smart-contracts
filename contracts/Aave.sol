// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
pragma abicoder v2;

import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Aave is Initializable{

    // Storage Variables
    address public borrowTokenAddress;
    address public supplyTokenAddress;
    address public aavePoolAddress;


    function initialize() public initializer {
        borrowTokenAddress = 0xDF1742fE5b0bFc12331D8EAec6b478DfDbD31464; // Goerli Aave DAI
        supplyTokenAddress = 0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43; // Goerli Aave USDC
        aavePoolAddress = 0x368EedF3f56ad10b9bC57eed4Dac65B26Bb667f6;    // Goerli Aave Pool Address
    }

    function supply(uint _userAmount, uint _total) public returns (bool) {
        // 1. Transfer _useramount from user to contract
        IERC20(supplyTokenAddress).transferFrom(msg.sender, address(this), _userAmount * 1000000);

        // 2. Approve Aave pool to access _total from this contract
        IERC20(supplyTokenAddress).approve(aavePoolAddress, _total * 1000000);

        // 3. Supply _total to Aave pool
        IPool(aavePoolAddress).supply(supplyTokenAddress, _total * 1000000, address(this), 0);

        return true;
    }

    function borrow() public returns (bool) {
        // Borrow 0.3 DAI to contract
        IPool(aavePoolAddress).borrow(borrowTokenAddress, 0.3 ether, 2, 0, address(this));

        // Transfer DAI to user
        IERC20(borrowTokenAddress).transferFrom(address(this), msg.sender, 0.3 ether);

        return true;
    }
}
