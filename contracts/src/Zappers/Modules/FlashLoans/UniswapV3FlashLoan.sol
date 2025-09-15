// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "./UniswapV3/IUniswapV3PoolActions.sol";
import "./UniswapV3/IUniswapV3FlashCallback.sol";

import "../../Interfaces/ILeverageZapper.sol";
import "../../Interfaces/IFlashLoanReceiver.sol";
import "../../Interfaces/IFlashLoanProvider.sol";

contract UniswapV3FlashLoan is IUniswapV3FlashCallback, IFlashLoanProvider {
    using SafeERC20 for IERC20;

    struct FlashLoanPoolCfg {
        IUniswapV3PoolActions pool;
        bool isToken0;
    }

    IFlashLoanReceiver public receiver;
    mapping(address => FlashLoanPoolCfg) public flashLoanPools;

    constructor(address[] memory _tokens, FlashLoanPoolCfg[] memory _pools) {
        if (_tokens.length != _pools.length) {
            revert("LZ: Invalid input");
        }
        for (uint256 i = 0; i < _tokens.length; i++) {
            flashLoanPools[_tokens[i]] = _pools[i];
        }
    }

    function makeFlashLoan(
        IERC20 _token,
        uint256 _amount,
        Operation _operation,
        bytes calldata _params
    ) external {
        FlashLoanPoolCfg memory poolCfg = flashLoanPools[address(_token)];
        if (address(poolCfg.pool) == address(0)) {
            revert("LZ: No pool for token");
        }

        bytes memory userData;
        if (_operation == Operation.OpenTrove) {
            ILeverageZapper.OpenLeveragedTroveParams
                memory openTroveParams = abi.decode(
                    _params,
                    (ILeverageZapper.OpenLeveragedTroveParams)
                );
            userData = abi.encode(
                _token,
                poolCfg.isToken0,
                _amount,
                _operation,
                openTroveParams
            );
        } else if (_operation == Operation.LeverUpTrove) {
            ILeverageZapper.LeverUpTroveParams memory leverUpTroveParams = abi
                .decode(_params, (ILeverageZapper.LeverUpTroveParams));
            userData = abi.encode(
                _token,
                poolCfg.isToken0,
                _amount,
                _operation,
                leverUpTroveParams
            );
        } else if (_operation == Operation.LeverDownTrove) {
            ILeverageZapper.LeverDownTroveParams
                memory leverDownTroveParams = abi.decode(
                    _params,
                    (ILeverageZapper.LeverDownTroveParams)
                );
            userData = abi.encode(
                _token,
                poolCfg.isToken0,
                _amount,
                _operation,
                leverDownTroveParams
            );
        } else if (_operation == Operation.CloseTrove) {
            IZapper.CloseTroveParams memory closeTroveParams = abi.decode(
                _params,
                (IZapper.CloseTroveParams)
            );
            userData = abi.encode(
                _token,
                poolCfg.isToken0,
                _amount,
                _operation,
                closeTroveParams
            );
        } else {
            revert("LZ: Wrong Operation");
        }

        receiver = IFlashLoanReceiver(msg.sender);
        if (poolCfg.isToken0) {
            poolCfg.pool.flash(address(this), _amount, 0, userData);
        } else {
            poolCfg.pool.flash(address(this), 0, _amount, userData);
        }
        receiver = IFlashLoanReceiver(address(0));
    }

    function uniswapV3FlashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata userData
    ) external {
        (IERC20 token, bool isToken0, uint256 amount, Operation operation) = abi
            .decode(userData[0:128], (IERC20, bool, uint256, Operation));

        if (msg.sender != address(flashLoanPools[address(token)].pool)) {
            revert("LZ: Invalid sender");
        }

        uint256 feeAmount = fee1;
        if (isToken0) {
            feeAmount = fee0;
        }

        if (operation == Operation.OpenTrove) {
            // Open
            // decode params
            ILeverageZapper.OpenLeveragedTroveParams
                memory openTroveParams = abi.decode(
                    userData[128:],
                    (ILeverageZapper.OpenLeveragedTroveParams)
                );
            // Flash loan minus fees
            uint256 effectiveFlashLoanAmount = amount - feeAmount;
            // We send only effective flash loan, keeping fees here
            token.safeTransfer(address(receiver), effectiveFlashLoanAmount);
            // Zapper callback
            receiver.receiveFlashLoanOnOpenLeveragedTrove(
                openTroveParams,
                effectiveFlashLoanAmount
            );
        } else if (operation == Operation.LeverUpTrove) {
            // Lever up
            // decode params
            ILeverageZapper.LeverUpTroveParams memory leverUpTroveParams = abi
                .decode(userData[128:], (ILeverageZapper.LeverUpTroveParams));
            // Flash loan minus fees
            uint256 effectiveFlashLoanAmount = amount - feeAmount;
            // We send only effective flash loan, keeping fees here
            token.safeTransfer(address(receiver), effectiveFlashLoanAmount);
            // Zapper callback
            receiver.receiveFlashLoanOnLeverUpTrove(
                leverUpTroveParams,
                effectiveFlashLoanAmount
            );
        } else if (operation == Operation.LeverDownTrove) {
            // Lever down
            // decode params
            ILeverageZapper.LeverDownTroveParams
                memory leverDownTroveParams = abi.decode(
                    userData[128:],
                    (ILeverageZapper.LeverDownTroveParams)
                );
            // Flash loan minus fees
            uint256 effectiveFlashLoanAmount = amount - feeAmount;
            // We send only effective flash loan, keeping fees here
            token.safeTransfer(address(receiver), effectiveFlashLoanAmount);
            // Zapper callback
            receiver.receiveFlashLoanOnLeverDownTrove(
                leverDownTroveParams,
                effectiveFlashLoanAmount
            );
        } else if (operation == Operation.CloseTrove) {
            // Close trove
            // decode params
            IZapper.CloseTroveParams memory closeTroveParams = abi.decode(
                userData[128:],
                (IZapper.CloseTroveParams)
            );
            // Flash loan minus fees
            uint256 effectiveFlashLoanAmount = amount - feeAmount;
            // We send only effective flash loan, keeping fees here
            token.safeTransfer(address(receiver), effectiveFlashLoanAmount);
            // Zapper callback
            receiver.receiveFlashLoanOnCloseTroveFromCollateral(
                closeTroveParams,
                effectiveFlashLoanAmount
            );
        } else {
            revert("LZ: Wrong Operation");
        }

        // Return flash loan
        token.safeTransfer(msg.sender, amount + feeAmount);
    }
}
