// SPDX-License-Identifier: MIT
import "./IChainlinkPriceFeed.sol";
import "../Dependencies/AggregatorV3Interface.sol";

pragma solidity ^0.8.0;

interface IWBTCPriceFeed is IChainlinkPriceFeed {
    function tokenBtcOracle()
        external
        view
        returns (AggregatorV3Interface, uint256, uint8);
}
