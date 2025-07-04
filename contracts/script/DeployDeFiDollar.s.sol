// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {StdCheats} from "forge-std/StdCheats.sol";
import {IERC20Metadata} from "openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

import {StringFormatting} from "test/Utils/StringFormatting.sol";
import {Accounts} from "test/TestContracts/Accounts.sol";
import {ZERO_ADDRESS, ETH_GAS_COMPENSATION} from "src/Dependencies/Constants.sol";
import {IBorrowerOperations} from "src/Interfaces/IBorrowerOperations.sol";
import "src/AddressesRegistry.sol";
import "src/ActivePool.sol";
import "src/BoldToken.sol";
import "src/BorrowerOperations.sol";
import "src/TroveManager.sol";
import "src/TroveNFT.sol";
import "src/CollSurplusPool.sol";
import "src/DefaultPool.sol";
import "src/GasPool.sol";
import "src/HintHelpers.sol";
import "src/MultiTroveGetter.sol";
import "src/SortedTroves.sol";
import "src/StabilityPool.sol";
import "src/CollateralRegistry.sol";
import "test/TestContracts/MetadataDeployment.sol";
import "src/PriceFeeds/ChainlinkPriceFeed.sol";
import "src/PriceFeeds/CompositeChainlinkPriceFeed.sol";
import "src/PriceFeeds/PythPriceFeed.sol";
import "src/PriceFeeds/WBTCPriceFeed.sol";
import "src/Zappers/GasCompZapper.sol";
import "src/Zappers/Modules/Exchanges/Curve/ICurveStableswapNGFactory.sol";
import "forge-std/console2.sol";

contract DeployDeFiDollarScript is StdCheats, MetadataDeployment {
    using Strings for *;
    using StringFormatting for *;

    address WETH_ADDRESS = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address WBTC_ADDRESS = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
    address USDC_ADDRESS = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    IWETH WETH;
    IERC20 USDC;

    // Curve
    ICurveStableswapNGFactory curveStableswapFactory;
    // https://docs.curve.fi/deployments/amm/#stableswap-ng
    // Mainnet
    ICurveStableswapNGFactory constant curveStableswapFactoryMainnet =
        ICurveStableswapNGFactory(0x6A8cbed756804B16E05E741eDaBd5cB544AE21bf);
    uint128 constant BOLD_TOKEN_INDEX = 0;
    uint128 constant USDC_INDEX = 1;

    // Price feeds
    address constant PYTH_ORACLE_ADDRESS = 0x4305FB66699C3B2702D4d05CF36551390A4c69C6;
    address constant ETH_USD_PRICE_FEED = 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419;
    address constant BTC_USD_PRICE_FEED = 0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c;

    address constant GOVERNANCE_ADDRESS = 0x0268d016717884632a7Fd05043687Cef2e51137F;

    bytes32 SALT;
    address deployer;

    struct LiquityContracts {
        IAddressesRegistry addressesRegistry;
        IActivePool activePool;
        IBorrowerOperations borrowerOperations;
        ICollSurplusPool collSurplusPool;
        IDefaultPool defaultPool;
        ISortedTroves sortedTroves;
        IStabilityPool stabilityPool;
        ITroveManager troveManager;
        ITroveNFT troveNFT;
        MetadataNFT metadataNFT;
        IPriceFeed priceFeed;
        GasPool gasPool;
        IInterestRouter interestRouter;
        IERC20Metadata collToken;
        GasCompZapper gasCompZapper;
        ILeverageZapper leverageZapper;
    }

    struct LiquityContractAddresses {
        address activePool;
        address borrowerOperations;
        address collSurplusPool;
        address defaultPool;
        address sortedTroves;
        address stabilityPool;
        address troveManager;
        address troveNFT;
        address metadataNFT;
        address priceFeed;
        address gasPool;
        address interestRouter;
    }

    struct TroveManagerParams {
        uint256 CCR;
        uint256 MCR;
        uint256 SCR;
        uint256 BCR;
        uint256 LIQUIDATION_PENALTY_SP;
        uint256 LIQUIDATION_PENALTY_REDISTRIBUTION;
    }

    struct PriceFeedParams {
        address tokenUsdFeed;
        address tokenEthFeed;
        bytes32 pythFeedId;
        uint256 stalenessThreshold;
    }

    struct DeploymentVars {
        uint256 numCollaterals;
        IERC20Metadata[] collaterals;
        IPriceFeed[] priceFeeds;
        IAddressesRegistry[] addressesRegistries;
        ITroveManager[] troveManagers;
        LiquityContracts contracts;
        bytes bytecode;
        address boldTokenAddress;
        uint256 i;
    }

    struct DeploymentResult {
        LiquityContracts[] contractsArray;
        ICollateralRegistry collateralRegistry;
        IBoldToken boldToken;
        // ICurveStableswapNGPool usdcCurvePool;
        HintHelpers hintHelpers;
        MultiTroveGetter multiTroveGetter;
    }

    function run() external {
        string memory saltString = "DeFiDollar-USDFI";
        SALT = keccak256(abi.encodePacked(saltString));

        if (vm.envBytes("DEPLOYER").length == 20) {
            // address
            deployer = vm.envAddress("DEPLOYER");
            vm.startBroadcast(deployer);
        } else {
            // private key
            uint256 privateKey = vm.envUint("DEPLOYER");
            deployer = vm.addr(privateKey);
            vm.startBroadcast(privateKey);
        }

        console2.log(deployer, "deployer");
        console2.log(deployer.balance, "deployer balance");

        if (block.chainid == 1) {
            USDC = IERC20(USDC_ADDRESS);
            WETH = IWETH(WETH_ADDRESS);
            curveStableswapFactory = curveStableswapFactoryMainnet;
        }

        TroveManagerParams[] memory troveManagerParamsArray = new TroveManagerParams[](10);

                                                        // CCR,          MCR,          SCR,   BCR, LIQUIDATION_PENALTY_SP, LIQUIDATION_PENALTY_REDISTRIBUTION
        troveManagerParamsArray[0] = TroveManagerParams(139e16, 1333333333333333333, 110e16, 10e16, 5e16, 10e16); // FXS
        troveManagerParamsArray[1] = TroveManagerParams(139e16, 1333333333333333333, 110e16, 10e16, 5e16, 10e16); // LINK
        troveManagerParamsArray[2] = TroveManagerParams(139e16, 1333333333333333333, 110e16, 10e16, 5e16, 10e16); // UNI
        troveManagerParamsArray[3] = TroveManagerParams(139e16, 1333333333333333333, 110e16, 10e16, 5e16, 10e16); // SKY
        troveManagerParamsArray[4] = TroveManagerParams(139e16, 1333333333333333333, 110e16, 10e16, 5e16, 10e16); // CRV
        troveManagerParamsArray[5] = TroveManagerParams(139e16, 1333333333333333333, 110e16, 10e16, 5e16, 10e16); // AAVE
        troveManagerParamsArray[6] = TroveManagerParams(139e16, 1333333333333333333, 110e16, 10e16, 5e16, 10e16); // YFI
        troveManagerParamsArray[7] = TroveManagerParams(139e16, 1333333333333333333, 110e16, 10e16, 5e16, 10e16); // LDO
        troveManagerParamsArray[8] = TroveManagerParams(160e16, 1538461538461538461, 120e16, 10e16, 5e16, 10e16); // LQTY
        troveManagerParamsArray[9] = TroveManagerParams(122e16, 1176470588235294117, 110e16, 10e16, 5e16, 10e16); // WBTC

        address[] memory collTokens = new address[](10);
        collTokens[0] = 0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0; // FXS
        collTokens[1] = 0x514910771AF9Ca656af840dff83E8264EcF986CA; // LINK
        collTokens[2] = 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984; // UNI
        collTokens[3] = 0x56072C95FAA701256059aa122697B133aDEd9279; // SKY
        collTokens[4] = 0xD533a949740bb3306d119CC777fa900bA034cd52; // CRV
        collTokens[5] = 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9; // AAVE
        collTokens[6] = 0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e; // YFI
        collTokens[7] = 0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32; // LDO
        collTokens[8] = 0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D; // LQTY
        collTokens[9] = WBTC_ADDRESS; // WBTC

        PriceFeedParams[] memory priceFeeds = new PriceFeedParams[](10);
        priceFeeds[0] = PriceFeedParams({tokenUsdFeed: 0x6Ebc52C8C1089be9eB3945C4350B68B8E4C2233f, tokenEthFeed: ZERO_ADDRESS, pythFeedId: bytes32(0), stalenessThreshold: 48 hours}); // FXS
        priceFeeds[1] = PriceFeedParams({tokenUsdFeed: 0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c, tokenEthFeed: ZERO_ADDRESS, pythFeedId: bytes32(0), stalenessThreshold: 24 hours}); // LINK
        priceFeeds[2] = PriceFeedParams({tokenUsdFeed: 0x553303d460EE0afB37EdFf9bE42922D8FF63220e, tokenEthFeed: ZERO_ADDRESS, pythFeedId: bytes32(0), stalenessThreshold: 24 hours}); // UNI
        priceFeeds[3] = PriceFeedParams({tokenUsdFeed: 0xee10fE5E7aa92dd7b136597449c3d5813cFC5F18, tokenEthFeed: ZERO_ADDRESS, pythFeedId: bytes32(0), stalenessThreshold: 48 hours}); // SKY
        priceFeeds[4] = PriceFeedParams({tokenUsdFeed: 0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f, tokenEthFeed: ZERO_ADDRESS, pythFeedId: bytes32(0), stalenessThreshold: 48 hours}); // CRV
        priceFeeds[5] = PriceFeedParams({tokenUsdFeed: 0x547a514d5e3769680Ce22B2361c10Ea13619e8a9, tokenEthFeed: ZERO_ADDRESS, pythFeedId: bytes32(0), stalenessThreshold: 24 hours}); // AAVE
        priceFeeds[6] = PriceFeedParams({tokenUsdFeed: 0xA027702dbb89fbd58938e4324ac03B58d812b0E1, tokenEthFeed: ZERO_ADDRESS, pythFeedId: bytes32(0), stalenessThreshold: 48 hours}); // YFI
        priceFeeds[7] = PriceFeedParams({tokenUsdFeed: ZERO_ADDRESS, tokenEthFeed: 0x4e844125952D32AcdF339BE976c98E22F6F318dB, pythFeedId: bytes32(0), stalenessThreshold: 48 hours}); // LDO
        priceFeeds[8] = PriceFeedParams({tokenUsdFeed: ZERO_ADDRESS, tokenEthFeed: ZERO_ADDRESS, pythFeedId: 0x5e8b35b0da37ede980d8f4ddaa7988af73d8c3d110e3eddd2a56977beb839b63, stalenessThreshold: 48 hours}); // LQTY
        priceFeeds[9] = PriceFeedParams({tokenUsdFeed: ZERO_ADDRESS, tokenEthFeed: 0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23, pythFeedId: bytes32(0), stalenessThreshold: 48 hours}); // WBTC


        DeploymentResult memory deployed = _deployAndConnectContracts(troveManagerParamsArray, collTokens, priceFeeds);

        vm.stopBroadcast();

        vm.writeFile("deployment-manifest.json", _getManifestJson(deployed));
    }

    // See: https://solidity-by-example.org/app/create2/
    function getBytecode(bytes memory _creationCode, address _addressesRegistry) public pure returns (bytes memory) {
        return abi.encodePacked(_creationCode, abi.encode(_addressesRegistry));
    }

    function _deployAndConnectContracts(
        TroveManagerParams[] memory _troveManagerParamsArray,
        address[] memory _collTokens,
        PriceFeedParams[] memory _priceFeeds
    ) internal returns (DeploymentResult memory r) {
        assert(_collTokens.length == _troveManagerParamsArray.length);

        DeploymentVars memory vars;
        vars.numCollaterals = _troveManagerParamsArray.length;
        // Deploy Bold
        vars.bytecode = abi.encodePacked(type(BoldToken).creationCode, abi.encode(deployer));
        vars.boldTokenAddress = vm.computeCreate2Address(SALT, keccak256(vars.bytecode));
        r.boldToken = new BoldToken{salt: SALT}(deployer);
        assert(address(r.boldToken) == vars.boldTokenAddress);

        // USDC and USDC-BOLD pool
        // r.usdcCurvePool = _deployCurveBoldUsdcPool(r.boldToken);

        r.contractsArray = new LiquityContracts[](vars.numCollaterals);
        vars.collaterals = new IERC20Metadata[](vars.numCollaterals);
        vars.priceFeeds = new IPriceFeed[](vars.numCollaterals);
        vars.addressesRegistries = new IAddressesRegistry[](vars.numCollaterals);
        vars.troveManagers = new ITroveManager[](vars.numCollaterals);

        if (block.chainid == 1) {
            // mainnet
            for (vars.i = 0; vars.i < vars.numCollaterals; vars.i++) {
                vars.collaterals[vars.i] = IERC20Metadata(_collTokens[vars.i]);
                if (_priceFeeds[vars.i].tokenUsdFeed != ZERO_ADDRESS) {
                    vars.priceFeeds[vars.i] = new ChainlinkPriceFeed(_priceFeeds[vars.i].tokenUsdFeed, _priceFeeds[vars.i].stalenessThreshold);
                } else if (_collTokens[vars.i] == WBTC_ADDRESS) {
                    // WBTC/BTC -> BTC/USD = WBTC/USD
                    vars.priceFeeds[vars.i] = new WBTCPriceFeed(BTC_USD_PRICE_FEED, _priceFeeds[vars.i].tokenEthFeed, 24 hours, _priceFeeds[vars.i].stalenessThreshold);
                } else if (_priceFeeds[vars.i].tokenEthFeed != ZERO_ADDRESS) {
                    vars.priceFeeds[vars.i] = new CompositeChainlinkPriceFeed(ETH_USD_PRICE_FEED, _priceFeeds[vars.i].tokenEthFeed, 24 hours, _priceFeeds[vars.i].stalenessThreshold);
                } else if (_priceFeeds[vars.i].pythFeedId != bytes32(0)) {
                    vars.priceFeeds[vars.i] = new PythPriceFeed(PYTH_ORACLE_ADDRESS, _priceFeeds[vars.i].pythFeedId, _priceFeeds[vars.i].stalenessThreshold);
                } else {
                    revert("Invalid price feed params");
                }
                console2.log("%18e", IPriceFeed(vars.priceFeeds[vars.i]).lastGoodPrice(), "lastGoodPrice");
            }
        }

        // Deploy AddressesRegistries and get TroveManager addresses
        for (vars.i = 0; vars.i < vars.numCollaterals; vars.i++) {
            (IAddressesRegistry addressesRegistry, address troveManagerAddress) =
                _deployAddressesRegistry(_troveManagerParamsArray[vars.i]);
            vars.addressesRegistries[vars.i] = addressesRegistry;
            vars.troveManagers[vars.i] = ITroveManager(troveManagerAddress);
        }

        r.collateralRegistry = new CollateralRegistry(r.boldToken, vars.collaterals, vars.troveManagers);
        r.hintHelpers = new HintHelpers(r.collateralRegistry);
        r.multiTroveGetter = new MultiTroveGetter(r.collateralRegistry);

        // Deploy per-branch contracts for each branch
        for (vars.i = 0; vars.i < vars.numCollaterals; vars.i++) {
            vars.contracts = _deployAndConnectCollateralContracts(
                vars.collaterals[vars.i],
                vars.priceFeeds[vars.i],
                r.boldToken,
                r.collateralRegistry,
                // r.usdcCurvePool,
                vars.addressesRegistries[vars.i],
                address(vars.troveManagers[vars.i]),
                r.hintHelpers,
                r.multiTroveGetter
            );
            r.contractsArray[vars.i] = vars.contracts;
        }

        r.boldToken.setCollateralRegistry(address(r.collateralRegistry));

        // TODO: exchange helpers for leverage zapper
        // r.exchangeHelpers = new HybridCurveUniV3ExchangeHelpers(
        //     USDC,
        //     WETH,
        //     r.usdcCurvePool,
        //     USDC_INDEX, // USDC Curve pool index
        //     BOLD_TOKEN_INDEX, // BOLD Curve pool index
        //     UNIV3_FEE_USDC_WETH,
        //     UNIV3_FEE_WETH_COLL,
        //     uniV3QuoterSepolia
        // );
    }

    function _deployAddressesRegistry(TroveManagerParams memory _troveManagerParams)
        internal
        returns (IAddressesRegistry, address)
    {
        IAddressesRegistry addressesRegistry = new AddressesRegistry(
            deployer,
            _troveManagerParams.CCR,
            _troveManagerParams.MCR,
            _troveManagerParams.BCR,
            _troveManagerParams.SCR,
            _troveManagerParams.LIQUIDATION_PENALTY_SP,
            _troveManagerParams.LIQUIDATION_PENALTY_REDISTRIBUTION
        );
        address troveManagerAddress = vm.computeCreate2Address(
            SALT, keccak256(getBytecode(type(TroveManager).creationCode, address(addressesRegistry)))
        );

        return (addressesRegistry, troveManagerAddress);
    }

    function _deployAndConnectCollateralContracts(
        IERC20Metadata _collToken,
        IPriceFeed _priceFeed,
        IBoldToken _boldToken,
        ICollateralRegistry _collateralRegistry,
        // ICurveStableswapNGPool _usdcCurvePool, // For zappers
        IAddressesRegistry _addressesRegistry,
        address _troveManagerAddress,
        IHintHelpers _hintHelpers,
        IMultiTroveGetter _multiTroveGetter
    ) internal returns (LiquityContracts memory contracts) {
        LiquityContractAddresses memory addresses;
        contracts.collToken = _collToken;

        // Deploy all contracts, using testers for TM and PriceFeed
        contracts.addressesRegistry = _addressesRegistry;

        // Deploy Metadata
        contracts.metadataNFT = deployMetadata(SALT);
        addresses.metadataNFT = vm.computeCreate2Address(
            SALT, keccak256(getBytecode(type(MetadataNFT).creationCode, address(initializedFixedAssetReader)))
        );
        assert(address(contracts.metadataNFT) == addresses.metadataNFT);

        contracts.priceFeed = _priceFeed;

        contracts.interestRouter = IInterestRouter(GOVERNANCE_ADDRESS);
        addresses.borrowerOperations = vm.computeCreate2Address(
            SALT, keccak256(getBytecode(type(BorrowerOperations).creationCode, address(contracts.addressesRegistry)))
        );
        addresses.troveManager = _troveManagerAddress;
        addresses.troveNFT = vm.computeCreate2Address(
            SALT, keccak256(getBytecode(type(TroveNFT).creationCode, address(contracts.addressesRegistry)))
        );
        addresses.stabilityPool = vm.computeCreate2Address(
            SALT, keccak256(getBytecode(type(StabilityPool).creationCode, address(contracts.addressesRegistry)))
        );
        addresses.activePool = vm.computeCreate2Address(
            SALT, keccak256(getBytecode(type(ActivePool).creationCode, address(contracts.addressesRegistry)))
        );
        addresses.defaultPool = vm.computeCreate2Address(
            SALT, keccak256(getBytecode(type(DefaultPool).creationCode, address(contracts.addressesRegistry)))
        );
        addresses.gasPool = vm.computeCreate2Address(
            SALT, keccak256(getBytecode(type(GasPool).creationCode, address(contracts.addressesRegistry)))
        );
        addresses.collSurplusPool = vm.computeCreate2Address(
            SALT, keccak256(getBytecode(type(CollSurplusPool).creationCode, address(contracts.addressesRegistry)))
        );
        addresses.sortedTroves = vm.computeCreate2Address(
            SALT, keccak256(getBytecode(type(SortedTroves).creationCode, address(contracts.addressesRegistry)))
        );

        IAddressesRegistry.AddressVars memory addressVars = IAddressesRegistry.AddressVars({
            collToken: _collToken,
            borrowerOperations: IBorrowerOperations(addresses.borrowerOperations),
            troveManager: ITroveManager(addresses.troveManager),
            troveNFT: ITroveNFT(addresses.troveNFT),
            metadataNFT: IMetadataNFT(addresses.metadataNFT),
            stabilityPool: IStabilityPool(addresses.stabilityPool),
            priceFeed: contracts.priceFeed,
            activePool: IActivePool(addresses.activePool),
            defaultPool: IDefaultPool(addresses.defaultPool),
            gasPoolAddress: addresses.gasPool,
            collSurplusPool: ICollSurplusPool(addresses.collSurplusPool),
            sortedTroves: ISortedTroves(addresses.sortedTroves),
            interestRouter: contracts.interestRouter,
            hintHelpers: _hintHelpers,
            multiTroveGetter: _multiTroveGetter,
            collateralRegistry: _collateralRegistry,
            boldToken: _boldToken,
            WETH: WETH
        });
        // TODO: update setAddresses and don't renounce ownership
        contracts.addressesRegistry.setAddresses(addressVars);
        // TODO: sync with liquity deployment script
        // contracts.priceFeed.setAddresses(addresses.borrowerOperations);

        contracts.borrowerOperations = new BorrowerOperations{salt: SALT}(contracts.addressesRegistry);
        contracts.troveManager = new TroveManager{salt: SALT}(contracts.addressesRegistry);
        contracts.troveNFT = new TroveNFT{salt: SALT}(contracts.addressesRegistry);
        contracts.stabilityPool = new StabilityPool{salt: SALT}(contracts.addressesRegistry);
        contracts.activePool = new ActivePool{salt: SALT}(contracts.addressesRegistry);
        contracts.defaultPool = new DefaultPool{salt: SALT}(contracts.addressesRegistry);
        contracts.gasPool = new GasPool{salt: SALT}(contracts.addressesRegistry);
        contracts.collSurplusPool = new CollSurplusPool{salt: SALT}(contracts.addressesRegistry);
        contracts.sortedTroves = new SortedTroves{salt: SALT}(contracts.addressesRegistry);

        assert(address(contracts.borrowerOperations) == addresses.borrowerOperations);
        assert(address(contracts.troveManager) == addresses.troveManager);
        assert(address(contracts.troveNFT) == addresses.troveNFT);
        assert(address(contracts.stabilityPool) == addresses.stabilityPool);
        assert(address(contracts.activePool) == addresses.activePool);
        assert(address(contracts.defaultPool) == addresses.defaultPool);
        assert(address(contracts.gasPool) == addresses.gasPool);
        assert(address(contracts.collSurplusPool) == addresses.collSurplusPool);
        assert(address(contracts.sortedTroves) == addresses.sortedTroves);

        // Connect contracts
        _boldToken.setBranchAddresses(
            address(contracts.troveManager),
            address(contracts.stabilityPool),
            address(contracts.borrowerOperations),
            address(contracts.activePool)
        );

        contracts.gasCompZapper = _deployGasCompZapper(contracts.addressesRegistry);
        // TODO: deploy zappers
        // (contracts.gasCompZapper, contracts.wethZapper, contracts.leverageZapper) =
        //     _deployZappers(contracts.addressesRegistry, contracts.collToken, _boldToken, _usdcCurvePool);
    }

    function _deployGasCompZapper(
        IAddressesRegistry _addressesRegistry
    ) internal returns (GasCompZapper gasCompZapper) {
        // _exchange is set to borrowerOperations to avoid approving collToken to unknown contracts or zero address
        gasCompZapper = new GasCompZapper(_addressesRegistry, IFlashLoanProvider(ZERO_ADDRESS), IExchange(address(_addressesRegistry.borrowerOperations())));
    }

    function formatAmount(uint256 amount, uint256 decimals, uint256 digits) internal pure returns (string memory) {
        if (digits > decimals) {
            digits = decimals;
        }

        uint256 scaled = amount / (10 ** (decimals - digits));
        string memory whole = Strings.toString(scaled / (10 ** digits));

        if (digits == 0) {
            return whole;
        }

        string memory fractional = Strings.toString(scaled % (10 ** digits));
        for (uint256 i = bytes(fractional).length; i < digits; i++) {
            fractional = string.concat("0", fractional);
        }
        return string.concat(whole, ".", fractional);
    }

    function _getBranchContractsJson(LiquityContracts memory c) internal view returns (string memory) {
        return string.concat(
            "{",
            string.concat(
                // Avoid stack too deep by chunking concats
                string.concat(
                    string.concat('"collSymbol":"', c.collToken.symbol(), '",'), // purely for human-readability
                    string.concat('"collToken":"', address(c.collToken).toHexString(), '",'),
                    string.concat('"addressesRegistry":"', address(c.addressesRegistry).toHexString(), '",'),
                    string.concat('"activePool":"', address(c.activePool).toHexString(), '",'),
                    string.concat('"borrowerOperations":"', address(c.borrowerOperations).toHexString(), '",'),
                    string.concat('"collSurplusPool":"', address(c.collSurplusPool).toHexString(), '",'),
                    string.concat('"defaultPool":"', address(c.defaultPool).toHexString(), '",'),
                    string.concat('"sortedTroves":"', address(c.sortedTroves).toHexString(), '",')
                ),
                string.concat(
                    string.concat('"stabilityPool":"', address(c.stabilityPool).toHexString(), '",'),
                    string.concat('"troveManager":"', address(c.troveManager).toHexString(), '",'),
                    string.concat('"troveNFT":"', address(c.troveNFT).toHexString(), '",'),
                    string.concat('"metadataNFT":"', address(c.metadataNFT).toHexString(), '",'),
                    string.concat('"priceFeed":"', address(c.priceFeed).toHexString(), '",'),
                    string.concat('"gasPool":"', address(c.gasPool).toHexString(), '",'),
                    string.concat('"interestRouter":"', address(c.interestRouter).toHexString(), '",')
                ),
                string.concat(
                    string.concat('"gasCompZapper":"', address(c.gasCompZapper).toHexString(), '",'),
                    string.concat('"leverageZapper":"', address(c.gasCompZapper).toHexString(), '"') // no comma
                )
            ),
            "}"
        );
    }

    function _getDeploymentConstants() internal pure returns (string memory) {
        return string.concat(
            "{",
            string.concat(
                string.concat('"ETH_GAS_COMPENSATION":"', ETH_GAS_COMPENSATION.toString(), '",'),
                string.concat('"INTEREST_RATE_ADJ_COOLDOWN":"', INTEREST_RATE_ADJ_COOLDOWN.toString(), '",'),
                string.concat('"MAX_ANNUAL_INTEREST_RATE":"', MAX_ANNUAL_INTEREST_RATE.toString(), '",'),
                string.concat('"MIN_ANNUAL_INTEREST_RATE":"', MIN_ANNUAL_INTEREST_RATE.toString(), '",'),
                string.concat('"MIN_DEBT":"', MIN_DEBT.toString(), '",'),
                string.concat('"SP_YIELD_SPLIT":"', SP_YIELD_SPLIT.toString(), '",'),
                string.concat('"UPFRONT_INTEREST_PERIOD":"', UPFRONT_INTEREST_PERIOD.toString(), '"') // no comma
            ),
            "}"
        );
    }

    function _getManifestJson(DeploymentResult memory deployed)
        internal
        view
        returns (string memory)
    {
        string[] memory branches = new string[](deployed.contractsArray.length);

        // Poor man's .map()
        for (uint256 i = 0; i < branches.length; ++i) {
            branches[i] = _getBranchContractsJson(deployed.contractsArray[i]);
        }

        return string.concat(
            "{",
            string.concat(
                string.concat('"constants":', _getDeploymentConstants(), ","),
                string.concat('"collateralRegistry":"', address(deployed.collateralRegistry).toHexString(), '",'),
                string.concat('"boldToken":"', address(deployed.boldToken).toHexString(), '",'),
                string.concat('"hintHelpers":"', address(deployed.hintHelpers).toHexString(), '",'),
                string.concat('"multiTroveGetter":"', address(deployed.multiTroveGetter).toHexString(), '",'),
                // string.concat('"exchangeHelpers":"', address(deployed.exchangeHelpers).toHexString(), '",'),
                string.concat('"branches":[', branches.join(","), "]")
            ),
            "}"
        );
    }
}
