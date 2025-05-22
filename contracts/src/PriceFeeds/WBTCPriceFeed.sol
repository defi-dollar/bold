// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "./ChainlinkPriceFeedBase.sol";
import "../Interfaces/IWBTCPriceFeed.sol";

// import "forge-std/console2.sol";

contract WBTCPriceFeed is ChainlinkPriceFeedBase, IWBTCPriceFeed {
    constructor(
        address _btcUsdOracleAddress,
        address _tokenBtcOracleAddress,
        uint256 _btcUsdStalenessThreshold,
        uint256 _tokenBtcStalenessThreshold
    ) ChainlinkPriceFeedBase(_btcUsdOracleAddress, _btcUsdStalenessThreshold) {
        // Store token-BTC oracle
        tokenBtcOracle.aggregator = AggregatorV3Interface(
            _tokenBtcOracleAddress
        );
        tokenBtcOracle.stalenessThreshold = _tokenBtcStalenessThreshold;
        tokenBtcOracle.decimals = tokenBtcOracle.aggregator.decimals();

        _fetchPricePrimary();

        // Check the oracle didn't already fail
        assert(priceSource == PriceSource.primary);
    }

    Oracle public tokenBtcOracle;

    function _fetchPricePrimary() internal returns (uint256, bool) {
        assert(priceSource == PriceSource.primary);
        (uint256 btcUsdPrice, bool btcUsdOracleDown) = _getOracleAnswer(
            usdOracle
        );
        (uint256 tokenBtcPrice, bool tokenBtcOracleDown) = _getOracleAnswer(
            tokenBtcOracle
        );

        if (btcUsdOracleDown) {
            return (
                _shutDownAndSwitchToLastGoodPrice(
                    address(usdOracle.aggregator)
                ),
                true
            );
        }
        if (tokenBtcOracleDown) {
            return (
                _shutDownAndSwitchToLastGoodPrice(
                    address(tokenBtcOracle.aggregator)
                ),
                true
            );
        }

        uint256 tokenUsdPrice = ((btcUsdPrice * tokenBtcPrice) * 1e10) / 1e18; // wbtc has 8 decimals
        lastGoodPrice = tokenUsdPrice;

        return (tokenUsdPrice, false);
    }

    // Returns:
    // - The price, using the current price calculation
    // - A bool that is true if:
    // --- a) the system was not shut down prior to this call, and
    // --- b) an oracle or exchange rate contract failed during this call.
    function fetchPrice() public returns (uint256, bool) {
        // If branch is live and the primary oracle setup has been working, try to use it
        if (priceSource == PriceSource.primary) return _fetchPricePrimary();

        assert(priceSource == PriceSource.lastGoodPrice);
        return (lastGoodPrice, false);
    }

    function fetchRedemptionPrice() external returns (uint256, bool) {
        // Use same price for redemption as all other ops in branch
        return fetchPrice();
    }
}
