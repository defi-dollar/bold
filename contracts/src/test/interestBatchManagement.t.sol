pragma solidity ^0.8.18;

import "../Dependencies/AddRemoveManagers.sol";
import "./TestContracts/DevTestSetup.sol";

contract InterestBatchManagementTest is DevTestSetup {
    function testCannotSetExsitingBatchManager() public {
        registerBatchManager(B);

        vm.startPrank(B);
        vm.expectRevert(BorrowerOperations.BatchManagerExists.selector);
        borrowerOperations.registerBatchManager(1e16, 20e16, 5e16, 25e14, 0);
        vm.stopPrank();
    }

    function testCannotAdjustInterestOfBatchedTrove() public {
        uint256 troveId = openTroveAndJoinBatchManager();

        vm.startPrank(A);
        vm.expectRevert(BorrowerOperations.TroveInBatch.selector);
        borrowerOperations.adjustTroveInterestRate(troveId, 10e16, 0, 0, 10000e18);
        vm.stopPrank();
    }

    function testSetsBatchManagerProperlyOnOpen() public {
        uint256 troveId = openTroveAndJoinBatchManager();

        address batchManagerAddress = borrowerOperations.interestBatchManagerOf(troveId);
        assertEq(batchManagerAddress, B, "Wrong batch manager in BO");
        (,,,,,,,, address tmBatchManagerAddress,) = troveManager.Troves(troveId);
        assertEq(tmBatchManagerAddress, B, "Wrong batch manager in TM");

        IBorrowerOperations.InterestBatchManager memory batchManager =
            borrowerOperations.getInterestBatchManager(batchManagerAddress);
        assertEq(batchManager.minInterestRate, 1e16, "Wrong min interest");
        assertEq(batchManager.maxInterestRate, 20e16, "Wrong max interest");
        assertEq(batchManager.minInterestRateChangePeriod, MIN_INTEREST_RATE_CHANGE_PERIOD, "Wrong min change period");
        LatestBatchData memory batch = troveManager.getLatestBatchData(batchManagerAddress);
        assertEq(batch.annualManagementFee, 25e14, "Wrong fee");
    }

    function testSetsBatchManagerProperlyAfterOpening() public {
        registerBatchManager(B);

        uint256 troveId = openTroveNoHints100pct(A, 100e18, 5000e18, 5e16);

        vm.startPrank(A);
        borrowerOperations.setInterestBatchManager(troveId, B, 0, 0, 1e24);
        vm.stopPrank();

        address batchManagerAddress = borrowerOperations.interestBatchManagerOf(troveId);
        assertEq(batchManagerAddress, B, "Wrong batch manager in BO");
        (,,,,,,,, address tmBatchManagerAddress,) = troveManager.Troves(troveId);
        assertEq(tmBatchManagerAddress, B, "Wrong batch manager in TM");

        IBorrowerOperations.InterestBatchManager memory batchManager =
            borrowerOperations.getInterestBatchManager(batchManagerAddress);
        assertEq(batchManager.minInterestRate, 1e16, "Wrong min interest");
        assertEq(batchManager.maxInterestRate, 20e16, "Wrong max interest");
        assertEq(batchManager.minInterestRateChangePeriod, MIN_INTEREST_RATE_CHANGE_PERIOD, "Wrong min change period");
        LatestBatchData memory batch = troveManager.getLatestBatchData(batchManagerAddress);
        assertEq(batch.annualManagementFee, 25e14, "Wrong fee");
    }

    function testCannotSetBatchManagerIfTroveDoesNotExist() public {
        registerBatchManager(B);

        vm.startPrank(A);
        vm.expectRevert(BorrowerOperations.TroveNotActive.selector);
        borrowerOperations.setInterestBatchManager(addressToTroveId(A), B, 0, 0, 1e24);
        vm.stopPrank();
    }

    function testCannotSetBatchManagerIfTroveIsClosed() public {
        registerBatchManager(B);

        // Open trove
        uint256 troveId = openTroveNoHints100pct(A, 100e18, 5000e18, 5e16);
        // Open another trove so that we can close the first one
        openTroveNoHints100pct(B, 100e18, 5000e18, 5e16);

        // Close trove
        deal(address(boldToken), A, 6000e18); // Needs more Bold for interest and upfront fee
        closeTrove(A, troveId);

        // Try to set interest batch manager
        vm.startPrank(A);
        vm.expectRevert(BorrowerOperations.TroveNotActive.selector);
        borrowerOperations.setInterestBatchManager(troveId, B, 0, 0, 1e24);
        vm.stopPrank();
    }

    function testCannotSetBatchManagerIfTroveIsLiquidated() public {
        priceFeed.setPrice(2000e18);
        registerBatchManager(B);

        // Open trove
        uint256 troveId = openTroveNoHints100pct(A, 5e18, 5000e18, 5e16);
        // Open another trove so that we can liquidate the first one
        openTroveNoHints100pct(B, 100e18, 5000e18, 5e16);

        // Price goes down
        priceFeed.setPrice(1050e18);

        // Close trove
        liquidate(A, troveId);

        // Try to set interest batch manager
        vm.startPrank(A);
        vm.expectRevert(BorrowerOperations.TroveNotActive.selector);
        borrowerOperations.setInterestBatchManager(troveId, B, 0, 0, 1e24);
        vm.stopPrank();
    }

    function testCannotSetBatchManagerIfTroveIsUnredeemable() public {
        registerBatchManager(B);

        // Open trove
        uint256 troveId = openTroveNoHints100pct(A, 100e18, 5000e18, 5e16);

        // Redeem from trove
        redeem(A, 4000e18);

        // Try to set interest batch manager
        vm.startPrank(A);
        vm.expectRevert(BorrowerOperations.TroveNotActive.selector);
        borrowerOperations.setInterestBatchManager(troveId, B, 0, 0, 1e24);
        vm.stopPrank();
    }

    function testRemovesBatchManagerProperlyWithDifferentNewInterestRate() public {
        uint256 troveId = openTroveAndJoinBatchManager();
        (,,,,,,,, address tmBatchManagerAddress,) = troveManager.Troves(troveId);
        LatestTroveData memory trove = troveManager.getLatestTroveData(troveId);
        uint256 annualInterestRate = trove.annualInterestRate;

        uint256 newAnnualInterestRate = 4e16;
        assertEq(tmBatchManagerAddress, B, "Wrong batch manager in TM");
        assertNotEq(newAnnualInterestRate, annualInterestRate, "New interest rate should be different");

        vm.startPrank(A);
        borrowerOperations.removeFromBatch(troveId, newAnnualInterestRate, 0, 0, 1e24);
        vm.stopPrank();

        assertEq(borrowerOperations.interestBatchManagerOf(troveId), address(0), "Wrong batch manager in BO");
        (,,,,,,, annualInterestRate, tmBatchManagerAddress,) = troveManager.Troves(troveId);
        assertEq(tmBatchManagerAddress, address(0), "Wrong batch manager in TM");
        assertEq(annualInterestRate, newAnnualInterestRate, "Wrong interest rate");
    }

    function testRemovesBatchManagerProperlyWithSameNewInterestRate() public {
        uint256 troveId = openTroveAndJoinBatchManager();
        (,,,,,,,, address tmBatchManagerAddress,) = troveManager.Troves(troveId);
        LatestTroveData memory trove = troveManager.getLatestTroveData(troveId);
        uint256 annualInterestRate = trove.annualInterestRate;

        uint256 newAnnualInterestRate = 5e16;
        assertEq(tmBatchManagerAddress, B, "Wrong batch manager in TM");
        assertEq(newAnnualInterestRate, annualInterestRate, "New interest rate should be the same");

        vm.startPrank(A);
        borrowerOperations.removeFromBatch(troveId, newAnnualInterestRate, 0, 0, 1e24);
        vm.stopPrank();

        assertEq(borrowerOperations.interestBatchManagerOf(troveId), address(0), "Wrong batch manager in BO");
        (,,,,,,, annualInterestRate, tmBatchManagerAddress,) = troveManager.Troves(troveId);
        assertEq(tmBatchManagerAddress, address(0), "It should not have batch manager in TM");
        assertEq(annualInterestRate, newAnnualInterestRate, "Wrong interest rate");
    }

    function testOnlyBorrowerCanSetBatchManager() public {
        registerBatchManager(A);
        registerBatchManager(B);
        registerBatchManager(C);

        uint256 troveId = openTroveNoHints100pct(A, 100e18, 5000e18, 5e16);

        vm.startPrank(B);
        vm.expectRevert(AddRemoveManagers.NotBorrower.selector);
        borrowerOperations.setInterestBatchManager(troveId, B, 0, 0, 1e24);
        vm.expectRevert(AddRemoveManagers.NotBorrower.selector);
        borrowerOperations.setInterestBatchManager(troveId, A, 0, 0, 1e24);
        vm.expectRevert(AddRemoveManagers.NotBorrower.selector);
        borrowerOperations.setInterestBatchManager(troveId, C, 0, 0, 1e24);
        vm.stopPrank();
    }

    function testCannotSetUnregisteredBatchManager() public {
        uint256 troveId = openTroveNoHints100pct(A, 100e18, 5000e18, 5e16);

        vm.startPrank(A);
        vm.expectRevert(BorrowerOperations.InvalidInterestBatchManager.selector);
        borrowerOperations.setInterestBatchManager(troveId, B, 0, 0, 1e24);
        vm.stopPrank();
    }

    function testSetBatchManagerRemovesIndividualDelegate() public {
        vm.startPrank(B);
        borrowerOperations.registerBatchManager(1e16, 20e16, 5e16, 25e14, MIN_INTEREST_RATE_CHANGE_PERIOD);
        vm.stopPrank();

        // Open trove
        uint256 troveId = openTroveNoHints100pct(A, 100e18, 5000e18, 5e16);
        // Set individual delegate (C)
        vm.startPrank(A);
        borrowerOperations.setInterestIndividualDelegate(troveId, C, 1e16, 20e16, 0, 0, 0, 0);
        vm.stopPrank();

        IBorrowerOperations.InterestIndividualDelegate memory delegate =
            borrowerOperations.getInterestIndividualDelegateOf(troveId);
        assertEq(borrowerOperations.interestBatchManagerOf(troveId), address(0), "Batch manager should be empty");
        assertEq(delegate.account, C, "Wrong individual delegate");

        // Switch batch manager (B)
        vm.startPrank(A);
        borrowerOperations.setInterestBatchManager(troveId, B, 0, 0, 1e24);
        vm.stopPrank();

        delegate = borrowerOperations.getInterestIndividualDelegateOf(troveId);
        assertEq(borrowerOperations.interestBatchManagerOf(troveId), B, "Wrong batch manager");
        assertEq(delegate.account, address(0), "Individual delegate should be empty");
    }

    function testLowerBatchManagementFee() public {
        uint256 troveId = openTroveAndJoinBatchManager();

        // Fast forward 1 year
        vm.warp(block.timestamp + 365 days);

        uint256 ATroveRecordedDebtBefore = troveManager.getTroveDebt(troveId);
        uint256 ATroveEntireDebtBefore = troveManager.getTroveEntireDebt(troveId);
        assertGt(ATroveEntireDebtBefore, ATroveRecordedDebtBefore, "Trove entire debt should be greater than recorded");
        LatestBatchData memory batch = troveManager.getLatestBatchData(B);
        uint256 batchRecordedDebtBefore = batch.recordedDebt;
        uint256 batchEntireDebtBefore = batch.entireDebtWithoutRedistribution;
        assertGt(batchEntireDebtBefore, batchRecordedDebtBefore, "Batch entire debt should be greater than recorded");

        vm.startPrank(B);
        borrowerOperations.lowerBatchManagementFee(10e14);
        vm.stopPrank();

        // Check interest and fee were applied
        assertEq(troveManager.getTroveDebt(troveId), ATroveEntireDebtBefore, "Interest was not applied to trove");
        assertEq(
            troveManager.getTroveDebt(troveId),
            troveManager.getTroveEntireDebt(troveId),
            "Trove recorded debt should be equal to entire"
        );
        batch = troveManager.getLatestBatchData(B);
        assertEq(batch.recordedDebt, batchEntireDebtBefore, "Interest was not applied to batch");
        assertEq(
            batch.recordedDebt, batch.entireDebtWithoutRedistribution, "Batch recorded debt should be equal to entire"
        );

        // Check new fee
        assertEq(batch.annualManagementFee, 10e14, "Wrong batch management fee");
    }

    function testOnlyBatchManagerCanLowerBatchManagementFee() public {
        openTroveAndJoinBatchManager();

        vm.startPrank(C);
        vm.expectRevert(BorrowerOperations.InvalidInterestBatchManager.selector);
        borrowerOperations.lowerBatchManagementFee(10e14);
        vm.stopPrank();
    }

    function testCannotIncreaseBatchManagementFee() public {
        openTroveAndJoinBatchManager();

        vm.startPrank(B);
        vm.expectRevert(BorrowerOperations.NewFeeNotLower.selector);
        borrowerOperations.lowerBatchManagementFee(50e14);
        vm.stopPrank();
    }

    function testLowerBatchManagementFeeDoesNotApplyRedistributionGains() public {
        uint256 troveId = openTroveAndJoinBatchManager();

        // TODO: Generate redistributions and check below

        vm.startPrank(B);
        borrowerOperations.lowerBatchManagementFee(10e14);
        vm.stopPrank();
    }

    function testChangeBatchInterestRate() public {
        uint256 troveId = openTroveAndJoinBatchManager();

        // Fast forward 1 year
        vm.warp(block.timestamp + 365 days);

        uint256 ATroveRecordedDebtBefore = troveManager.getTroveDebt(troveId);
        uint256 ATroveEntireDebtBefore = troveManager.getTroveEntireDebt(troveId);
        assertGt(ATroveEntireDebtBefore, ATroveRecordedDebtBefore, "Trove entire debt should be greater than recorded");
        LatestBatchData memory batch = troveManager.getLatestBatchData(B);
        uint256 batchRecordedDebtBefore = batch.recordedDebt;
        uint256 batchEntireDebtBefore = batch.entireDebtWithoutRedistribution;
        assertGt(batchEntireDebtBefore, batchRecordedDebtBefore, "Batch entire debt should be greater than recorded");

        vm.startPrank(B);
        borrowerOperations.setBatchManagerAnnualInterestRate(6e16, 0, 0, 100000e18);
        vm.stopPrank();

        // Check interest was applied
        assertEq(troveManager.getTroveDebt(troveId), ATroveEntireDebtBefore, "Interest was not applied to trove");
        assertEq(
            troveManager.getTroveDebt(troveId),
            troveManager.getTroveEntireDebt(troveId),
            "Trove recorded debt should be equal to entire"
        );
        batch = troveManager.getLatestBatchData(B);
        assertEq(batch.recordedDebt, batchEntireDebtBefore, "Interest was not applied to batch");
        assertEq(
            batch.recordedDebt, batch.entireDebtWithoutRedistribution, "Batch recorded debt should be equal to entire"
        );

        // Check new interest rate
        assertEq(troveManager.getBatchAnnualInterestRate(B), 6e16, "Wrong batch interest rate");
    }

    function testOnlyBatchManagerCanChangeBatchInterestRate() public {
        openTroveAndJoinBatchManager();

        vm.startPrank(C);
        vm.expectRevert(BorrowerOperations.InvalidInterestBatchManager.selector);
        borrowerOperations.setBatchManagerAnnualInterestRate(6e16, 0, 0, 100000e18);
        vm.stopPrank();
    }

    function testCannotChangeBatchToWrongInterestRate() public {
        openTroveAndJoinBatchManager();

        vm.startPrank(B);
        vm.expectRevert(BorrowerOperations.InterestNotInRange.selector);
        borrowerOperations.setBatchManagerAnnualInterestRate(0, 0, 0, 100000e18);
        vm.expectRevert(BorrowerOperations.InterestNotInRange.selector);
        borrowerOperations.setBatchManagerAnnualInterestRate(2e18, 0, 0, 100000e18);
        vm.stopPrank();
    }

    function testCannotChangeBatchInterestRateOutsideOwnRange() public {
        openTroveAndJoinBatchManager();

        vm.startPrank(B);
        vm.expectRevert(BorrowerOperations.InterestNotInRange.selector);
        borrowerOperations.setBatchManagerAnnualInterestRate(uint128(MIN_ANNUAL_INTEREST_RATE), 0, 0, 100000e18);
        vm.expectRevert(BorrowerOperations.InterestNotInRange.selector);
        borrowerOperations.setBatchManagerAnnualInterestRate(21e16, 0, 0, 100000e18);
        vm.stopPrank();
    }

    function testChangeBatchInterestRateDoesNotApplyRedistributionGains() public {
        uint256 troveId = openTroveAndJoinBatchManager();

        // TODO: Generate redistributions and check below

        vm.warp(block.timestamp + MIN_INTEREST_RATE_CHANGE_PERIOD);

        vm.startPrank(B);
        borrowerOperations.setBatchManagerAnnualInterestRate(6e16, 0, 0, 100000e18);
        vm.stopPrank();
    }

    function testSwitchFromOldToNewBatchManager() public {
        ABCDEF memory troveIDs;
        ABCDEF memory troveRecordedDebtBefore;
        ABCDEF memory troveEntireDebtBefore;
        ABCDEF memory batchRecordedDebtBefore;
        ABCDEF memory batchEntireDebtBefore;

        troveIDs.A = openTroveAndJoinBatchManager();

        // Register a new batch manager and add a trove to it
        registerBatchManager(C);
        IBorrowerOperations.OpenTroveAndJoinInterestBatchManagerParams memory paramsD = IBorrowerOperations
            .OpenTroveAndJoinInterestBatchManagerParams({
            owner: D,
            ownerIndex: 0,
            collAmount: 100e18,
            boldAmount: 5000e18,
            upperHint: 0,
            lowerHint: 0,
            interestBatchManager: C,
            maxUpfrontFee: 1e24,
            addManager: address(0),
            removeManager: address(0),
            receiver: address(0)
        });
        vm.startPrank(D);
        troveIDs.D = borrowerOperations.openTroveAndJoinInterestBatchManager(paramsD);
        vm.stopPrank();

        // Add a new trove to first manager
        IBorrowerOperations.OpenTroveAndJoinInterestBatchManagerParams memory paramsE = IBorrowerOperations
            .OpenTroveAndJoinInterestBatchManagerParams({
            owner: E,
            ownerIndex: 0,
            collAmount: 100e18,
            boldAmount: 5000e18,
            upperHint: 0,
            lowerHint: 0,
            interestBatchManager: B,
            maxUpfrontFee: 1e24,
            addManager: address(0),
            removeManager: address(0),
            receiver: address(0)
        });
        vm.startPrank(E);
        troveIDs.E = borrowerOperations.openTroveAndJoinInterestBatchManager(paramsE);
        vm.stopPrank();

        // Fast forward 1 year
        vm.warp(block.timestamp + 365 days);

        // debts before
        troveRecordedDebtBefore.A = troveManager.getTroveDebt(troveIDs.A);
        troveEntireDebtBefore.A = troveManager.getTroveEntireDebt(troveIDs.A);
        assertGt(
            troveEntireDebtBefore.A, troveRecordedDebtBefore.A, "Trove A entire debt should be greater than recorded"
        );

        troveRecordedDebtBefore.D = troveManager.getTroveDebt(troveIDs.D);
        troveEntireDebtBefore.D = troveManager.getTroveEntireDebt(troveIDs.D);
        assertGt(
            troveEntireDebtBefore.D, troveRecordedDebtBefore.D, "Trove D entire debt should be greater than recorded"
        );

        troveRecordedDebtBefore.E = troveManager.getTroveDebt(troveIDs.E);
        troveEntireDebtBefore.E = troveManager.getTroveEntireDebt(troveIDs.E);
        assertGt(
            troveEntireDebtBefore.E, troveRecordedDebtBefore.E, "Trove E entire debt should be greater than recorded"
        );

        LatestBatchData memory batchB = troveManager.getLatestBatchData(B);
        batchRecordedDebtBefore.B = batchB.recordedDebt;
        batchEntireDebtBefore.B = batchB.entireDebtWithoutRedistribution;
        assertGt(
            batchEntireDebtBefore.B, batchRecordedDebtBefore.B, "Batch B entire debt should be greater than recorded"
        );

        LatestBatchData memory batchC = troveManager.getLatestBatchData(C);
        batchRecordedDebtBefore.C = batchC.recordedDebt;
        batchEntireDebtBefore.C = batchC.entireDebtWithoutRedistribution;
        assertGt(
            batchEntireDebtBefore.C, batchRecordedDebtBefore.C, "Batch C entire debt should be greater than recorded"
        );

        // Move the last trove from B to C
        //switchBatchManager(E, troveIDs.E, C);
        removeFromBatch(E, troveIDs.E, 5e16);
        uint256 upfrontFee = predictJoinBatchInterestRateUpfrontFee(troveIDs.E, C);
        setInterestBatchManager(E, troveIDs.E, C);

        // Check new batch manager
        assertEq(borrowerOperations.interestBatchManagerOf(troveIDs.E), C, "Wrong batch manager in BO");
        (,,,,,,,, address tmBatchManagerAddress,) = troveManager.Troves(troveIDs.E);
        assertEq(tmBatchManagerAddress, C, "Wrong batch manager in TM");

        // Check interest was applied
        assertApproxEqAbs(
            troveManager.getTroveDebt(troveIDs.A), troveEntireDebtBefore.A, 10, "Interest was not applied to trove A"
        );
        assertEq(
            troveManager.getTroveDebt(troveIDs.A),
            troveManager.getTroveEntireDebt(troveIDs.A),
            "Trove A recorded debt should be equal to entire"
        );

        assertApproxEqAbs(
            troveManager.getTroveDebt(troveIDs.D), troveEntireDebtBefore.D, 1, "Interest was not applied to trove D"
        );
        assertEq(
            troveManager.getTroveDebt(troveIDs.D),
            troveManager.getTroveEntireDebt(troveIDs.D),
            "Trove D recorded debt should be equal to entire"
        );

        assertApproxEqAbs(
            troveManager.getTroveDebt(troveIDs.E),
            troveEntireDebtBefore.E + upfrontFee,
            1,
            "Interest was not applied to trove E"
        );
        assertEq(
            troveManager.getTroveDebt(troveIDs.E),
            troveManager.getTroveEntireDebt(troveIDs.E),
            "Trove E recorded debt should be equal to entire"
        );

        batchB = troveManager.getLatestBatchData(B);
        assertEq(
            batchB.recordedDebt,
            batchEntireDebtBefore.B - troveEntireDebtBefore.E,
            "Interest was not applied to batch B"
        );
        assertEq(
            batchB.recordedDebt,
            batchB.entireDebtWithoutRedistribution,
            "Batch B recorded debt should be equal to entire"
        );

        batchC = troveManager.getLatestBatchData(C);
        assertEq(
            batchC.recordedDebt,
            batchEntireDebtBefore.C + troveEntireDebtBefore.E + upfrontFee,
            "Interest was not applied to batch C"
        );
        assertEq(
            batchC.recordedDebt,
            batchC.entireDebtWithoutRedistribution,
            "Batch C recorded debt should be equal to entire"
        );
    }

    // --- applyBatchInterestAndFeePermissionless ---
    // (Now this is included in applyPendingDebt)

    function testApplyTroveInterestPermissionlessUpdatesRedistributionIfInBatch() public {
        priceFeed.setPrice(2000e18);
        uint256 troveDebtRequest = 2000e18;
        uint256 interestRate = 25e16;

        uint256 ATroveId = openTroveAndJoinBatchManager(A, 3 ether, troveDebtRequest, B, interestRate);

        // Open a trove to be liquidated and redistributed
        uint256 CTroveId = openTroveNoHints100pct(C, 2.1 ether, 2000e18, interestRate);
        // Price goes down
        priceFeed.setPrice(1000e18);
        // C is liquidated
        LatestTroveData memory troveData = troveManager.getLatestTroveData(ATroveId);
        uint256 initialEntireDebt = troveData.entireDebt;
        LatestTroveData memory troveDataC = troveManager.getLatestTroveData(CTroveId);
        uint256 entireDebtC = troveDataC.entireDebt;
        liquidate(A, CTroveId);

        // Check A has redistribution gains
        troveData = troveManager.getLatestTroveData(ATroveId);
        assertGt(troveData.redistBoldDebtGain, 0, "A should have redist gains");

        // Fast-forward time
        vm.warp(block.timestamp + 91 days);

        assertLt(troveManager.getTroveLastDebtUpdateTime(ATroveId), block.timestamp);

        troveData = troveManager.getLatestTroveData(ATroveId);
        uint256 accruedInterest = troveData.accruedInterest;
        uint256 accruedBatchManagementFee = troveData.accruedBatchManagementFee;
        // B applies A's pending interest
        vm.startPrank(B);
        borrowerOperations.applyPendingDebt(ATroveId);
        vm.stopPrank();

        troveData = troveManager.getLatestTroveData(ATroveId);
        assertEq(troveData.entireDebt, initialEntireDebt + accruedInterest + accruedBatchManagementFee + entireDebtC);
    }

    function testApplyBatchInterestPermissionlessSetsLastDebtUpdateTimeToNow() public {
        priceFeed.setPrice(2000e18);
        uint256 troveDebtRequest = 2000e18;
        uint256 interestRate = 25e16;

        uint256 ATroveId = openTroveAndJoinBatchManager(A, 3 ether, troveDebtRequest, B, interestRate);

        // Fast-forward time
        vm.warp(block.timestamp + 600);

        assertLt(troveManager.getBatchLastDebtUpdateTime(B), block.timestamp);
        assertLt(troveManager.getTroveLastDebtUpdateTime(ATroveId), block.timestamp);

        // C applies batch B's pending interest
        applyPendingDebt(C, ATroveId);

        assertEq(troveManager.getBatchLastDebtUpdateTime(B), block.timestamp);
        assertEq(troveManager.getTroveLastDebtUpdateTime(ATroveId), block.timestamp);
    }

    function testApplyBatchInterestPermissionlessReducesAccruedInterestTo0() public {
        priceFeed.setPrice(2000e18);
        uint256 troveDebtRequest = 2000e18;
        uint256 interestRate = 25e16;

        uint256 ATroveId = openTroveAndJoinBatchManager(A, 3 ether, troveDebtRequest, B, interestRate);

        // Fast-forward time
        vm.warp(block.timestamp + 600);

        assertGt(troveManager.calcBatchAccruedInterest(B), 0, "Batch should have accrued interest");
        assertGt(troveManager.calcTroveAccruedInterest(ATroveId), 0, "Trove should have accrued interest");

        // C applies batch B's pending interest
        applyPendingDebt(C, ATroveId);

        assertEq(troveManager.calcBatchAccruedInterest(B), 0, "Batch should not have accrued interest");
        assertEq(troveManager.calcTroveAccruedInterest(ATroveId), 0, "Trove should not have accrued interest");
    }

    function testApplyBatchInterestPermissionlessDoesntChangeEntireDebt() public {
        priceFeed.setPrice(2000e18);
        uint256 troveDebtRequest = 2000e18;
        uint256 interestRate = 25e16;

        uint256 ATroveId = openTroveAndJoinBatchManager(A, 3 ether, troveDebtRequest, B, interestRate);

        // Fast-forward time
        vm.warp(block.timestamp + 600);

        LatestBatchData memory batch = troveManager.getLatestBatchData(B);
        uint256 entireBatchDebt_1 = batch.entireDebtWithoutRedistribution;
        assertGt(entireBatchDebt_1, 0);
        uint256 entireTroveDebt_1 = troveManager.getTroveEntireDebt(ATroveId);
        assertGt(entireTroveDebt_1, 0);

        // C applies batch B's pending interest
        applyPendingDebt(C, ATroveId);

        batch = troveManager.getLatestBatchData(B);
        uint256 entireBatchDebt_2 = batch.entireDebtWithoutRedistribution;
        assertEq(entireBatchDebt_2, entireBatchDebt_1, "Batch entire debt mismatch");
        uint256 entireTroveDebt_2 = troveManager.getTroveEntireDebt(ATroveId);
        assertEq(entireTroveDebt_2, entireTroveDebt_1, "Trove entire debt mismatch");
    }

    function testApplyBatchInterestPermissionlessIncreasesRecordedDebtByAccruedInterest() public {
        priceFeed.setPrice(2000e18);
        uint256 troveDebtRequest = 2000e18;
        uint256 interestRate = 25e16;

        uint256 ATroveId = openTroveAndJoinBatchManager(A, 3 ether, troveDebtRequest, B, interestRate);

        // Fast-forward time
        vm.warp(block.timestamp + 600);

        LatestBatchData memory batch = troveManager.getLatestBatchData(B);
        uint256 recordedBatchDebt_1 = batch.recordedDebt;
        uint256 accruedBatchInterest = troveManager.calcBatchAccruedInterest(B);
        uint256 accruedBatchManagementFee = troveManager.calcBatchAccruedManagementFee(B);
        uint256 recordedTroveDebt_1 = troveManager.getTroveDebt(ATroveId);
        uint256 accruedTroveInterest = troveManager.calcTroveAccruedInterest(ATroveId);
        uint256 accruedTroveFee = troveManager.calcTroveAccruedBatchManagementFee(ATroveId);

        // C applies batch B's pending interest
        applyPendingDebt(C, ATroveId);

        batch = troveManager.getLatestBatchData(B);
        uint256 recordedBatchDebt_2 = batch.recordedDebt;
        uint256 recordedTroveDebt_2 = troveManager.getTroveDebt(ATroveId);

        assertEq(recordedBatchDebt_2, recordedBatchDebt_1 + accruedBatchInterest + accruedBatchManagementFee);
        assertEq(recordedTroveDebt_2, recordedTroveDebt_1 + accruedTroveInterest + accruedTroveFee);
    }

    function testApplyBatchInterestPermissionlessReinsertsIntoSortedTrovesIfInBatch() public {
        priceFeed.setPrice(2000e18);
        uint256 troveDebtRequest = 2000e18;
        uint256 interestRate = 25e16;

        uint256 ATroveId = openTroveAndJoinBatchManager(A, 3 ether, troveDebtRequest, B, interestRate);
        assertEq(sortedTroves.contains(ATroveId), true, "SortedTroves should have trove A ");
        assertEq(sortedTroves.isBatchedNode(ATroveId), true, "A should be batched in SortedTroves");

        // redeem from A
        redeem(A, 500e18);

        // Check A is zombie
        assertEq(uint8(troveManager.getTroveStatus(ATroveId)), uint8(ITroveManager.Status.unredeemable));

        // Fast-forward time
        vm.warp(block.timestamp + 3650 days);

        // C applies batch B's pending interest
        applyPendingDebt(C, ATroveId);

        // Check properly activaded and re-inserted
        assertEq(
            uint8(troveManager.getTroveStatus(ATroveId)), uint8(ITroveManager.Status.active), "A should not be zombie"
        );
        assertEq(sortedTroves.contains(ATroveId), true, "SortedTroves should have trove A ");
        assertEq(sortedTroves.isBatchedNode(ATroveId), true, "A should be batched in SortedTroves");
        address batchManagerAddress = borrowerOperations.interestBatchManagerOf(ATroveId);
        assertEq(batchManagerAddress, B, "Wrong batch manager in BO");
        (,,,,,,,, address tmBatchManagerAddress,) = troveManager.Troves(ATroveId);
        assertEq(tmBatchManagerAddress, B, "Wrong batch manager in TM");
    }

    function testSwitchBatchBatchManagerChargesUpfrontFeeIfJoinedOldLessThanCooldownAgo() public {
        // C registers as batch manager
        registerBatchManager(C, uint128(MIN_ANNUAL_INTEREST_RATE), 1e18, 5e16, 0, MIN_INTEREST_RATE_CHANGE_PERIOD);
        // A opens trove and joins batch manager B (which has the same interest)
        uint256 troveId = openTroveAndJoinBatchManager(A, 100 ether, 2000e18, B, 5e16);

        // Cool down period not gone by yet
        vm.warp(block.timestamp + INTEREST_RATE_ADJ_COOLDOWN - 60);
        uint256 ADebtBefore = troveManager.getTroveEntireDebt(troveId);
        uint256 upfrontFee = predictAdjustInterestRateUpfrontFee(troveId, 5e16);
        assertGt(upfrontFee, 0, "Upfront fee should be > 0");

        // Switch from B to C
        switchBatchManager(A, troveId, C);

        assertApproxEqAbs(
            troveManager.getTroveEntireDebt(troveId),
            ADebtBefore + upfrontFee,
            1e14,
            "A debt should have increased by upfront fee"
        );
    }

    function testSwitchBatchBatchManagerChargesUpfrontFeeIfOldBatchChangedFeeLessThanCooldownAgo() public {
        // C registers as batch manager
        registerBatchManager(C, uint128(MIN_ANNUAL_INTEREST_RATE), 1e18, 5e16, 0, MIN_INTEREST_RATE_CHANGE_PERIOD);
        // A opens trove and joins batch manager B
        uint256 troveId = openTroveAndJoinBatchManager(A, 100 ether, 2000e18, B, 4e16);

        // Cool down period has gone by
        vm.warp(block.timestamp + INTEREST_RATE_ADJ_COOLDOWN + 60);
        // B changes interest rate
        LatestBatchData memory batch = troveManager.getLatestBatchData(B);
        setBatchInterestRate(B, 5e16);
        batch = troveManager.getLatestBatchData(B);

        uint256 ADebtBefore = troveManager.getTroveEntireDebt(troveId);
        uint256 upfrontFee = predictAdjustInterestRateUpfrontFee(troveId, 5e16);
        assertGt(upfrontFee, 0, "Upfront fee should be > 0");
        // Switch from B to C
        switchBatchManager(A, troveId, C);
        assertApproxEqAbs(
            troveManager.getTroveEntireDebt(troveId),
            ADebtBefore + upfrontFee,
            1,
            "A debt should have increased by upfront fee"
        );
    }

    function testSwitchBatchBatchManagerDoesNotChargeTroveUpfrontFeeIfBatchChangesRateWithoutUpfrontFee() public {
        registerBatchManager(B, uint128(MIN_ANNUAL_INTEREST_RATE), 1e18, 5e16, 0, MIN_INTEREST_RATE_CHANGE_PERIOD);

        // Cool down period not gone by yet
        vm.warp(block.timestamp + INTEREST_RATE_ADJ_COOLDOWN - 60);

        // C registers as batch manager
        registerBatchManager(C, uint128(MIN_ANNUAL_INTEREST_RATE), 1e18, 5e16, 0, MIN_INTEREST_RATE_CHANGE_PERIOD);

        // A opens trove and joins batch manager B (which has the same interest)
        uint256 troveId = openTroveAndJoinBatchManager(A, 100 ether, 2000e18, B, 5e16);

        // Switch from B to C
        switchBatchManager(A, troveId, C);

        uint256 ADebtBefore = troveManager.getTroveEntireDebt(troveId);
        // B changes interest rate, but it doesn’t trigger upfront fee
        setBatchInterestRate(B, 10e16);

        assertEq(troveManager.getTroveEntireDebt(troveId), ADebtBefore, "A debt should be the same");
    }

    function testAnUnredeemableTroveGoesBackToTheBatch() public {
        // A opens trove and joins batch manager B
        uint256 troveId = openTroveAndJoinBatchManager(A, 100 ether, 2000e18, B, 5e16);

        // Open another trove with higher interest
        openTroveNoHints100pct(C, 100 ether, 2000e18, 10e16);

        vm.warp(block.timestamp + 10 days);

        // C redeems and makes A unredeemable
        redeem(C, 1000e18);

        // A adjusts back to normal
        adjustUnredeemableTrove(A, troveId, 0, false, 1000e18, true);

        assertEq(borrowerOperations.interestBatchManagerOf(troveId), B, "A should be in batch (BO)");
        (,,,,,,,, address tmBatchManagerAddress,) = troveManager.Troves(troveId);
        assertEq(tmBatchManagerAddress, B, "A should be in batch (TM)");
    }

    function testOpenTroveAndJoinBatchManagerChargesProperUpfrontFeeSimple() public {
        uint256 initialDebt = 2000e18;
        uint256 interestRate = 5e16;
        // A opens trove and joins batch manager B
        uint256 ATroveId = openTroveAndJoinBatchManager(A, 100 ether, initialDebt, B, interestRate);
        uint256 ATroveEntireDebt = troveManager.getTroveEntireDebt(ATroveId);
        uint256 expectedUpfrontFeeA =
            initialDebt * interestRate * UPFRONT_INTEREST_PERIOD / ONE_YEAR / DECIMAL_PRECISION;
        assertEq(ATroveEntireDebt - initialDebt, expectedUpfrontFeeA, "Wrong upfront fee for A");

        vm.warp(block.timestamp + 10 days);

        // C opens trove and joins batch manager B
        uint256 CTroveId = openTroveAndJoinBatchManager(C, 100 ether, 2000e18, B, interestRate);
        uint256 CTroveEntireDebt = troveManager.getTroveEntireDebt(CTroveId);
        uint256 expectedUpfrontFeeC =
            initialDebt * interestRate * UPFRONT_INTEREST_PERIOD / ONE_YEAR / DECIMAL_PRECISION;
        assertApproxEqAbs(CTroveEntireDebt - initialDebt, expectedUpfrontFeeC, 100, "Wrong upfront fee for C");
    }

    function testOpenTroveAndJoinBatchManagerChargesProperUpfrontFeeWithDifferentInterestRates() public {
        // D opens a regular trove
        uint256 DTroveId = openTroveNoHints100pct(D, 100 ether, 4000e18, 10e16);
        uint256 DInitialDebt = troveManager.getTroveEntireDebt(DTroveId);
        uint256 DWeightedDebt = DInitialDebt * 10e16;

        uint256 initialDebt = 2000e18;
        uint256 interestRate = 5e16;
        // A opens trove and joins batch manager B (with different interest rate than D)
        uint256 ATroveId = openTroveAndJoinBatchManager(A, 100 ether, initialDebt, B, interestRate);
        uint256 ATroveEntireDebt = troveManager.getTroveEntireDebt(ATroveId);
        uint256 avgInterestRate = (DWeightedDebt + initialDebt * interestRate) / (DInitialDebt + initialDebt);
        uint256 expectedUpfrontFeeA =
            initialDebt * avgInterestRate * UPFRONT_INTEREST_PERIOD / ONE_YEAR / DECIMAL_PRECISION;
        assertEq(ATroveEntireDebt - initialDebt, expectedUpfrontFeeA, "Wrong upfront fee for A");

        vm.warp(block.timestamp + 10 days);

        // C opens trove and joins batch manager B
        uint256 CTroveId = openTroveAndJoinBatchManager(C, 100 ether, 2000e18, B, interestRate);
        uint256 CTroveEntireDebt = troveManager.getTroveEntireDebt(CTroveId);
        ATroveEntireDebt = troveManager.getTroveEntireDebt(ATroveId);
        uint256 DTroveEntireDebt = troveManager.getTroveEntireDebt(DTroveId);
        //avgInterestRate = (DWeightedDebt + (ATroveEntireDebt + initialDebt) * interestRate) / (DInitialDebt + ATroveEntireDebt + initialDebt);
        avgInterestRate = (DWeightedDebt + (ATroveEntireDebt + initialDebt) * interestRate)
            / (DTroveEntireDebt + ATroveEntireDebt + initialDebt);
        uint256 expectedUpfrontFeeC =
            initialDebt * avgInterestRate * UPFRONT_INTEREST_PERIOD / ONE_YEAR / DECIMAL_PRECISION;
        assertApproxEqAbs(CTroveEntireDebt - initialDebt, expectedUpfrontFeeC, 1, "Wrong upfront fee for C");
    }
}