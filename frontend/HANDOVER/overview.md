# Overview

（這個檔案是透過 LLM 參考 git 生成，供未來參考及除錯）

## 概述

本文件記錄了在 `bold/frontend` repository 中完成的所有工作內容。從 2024年12月開始，到 2025年11月結束，期間共完成了 **246 個提交**，主要工作在 `frontend/defi-dollar`、`frontend/defi-dollar-coming-soon`、`frontend/spiceusd`、`feature/pool2` 等多個分支上進行。

整個開發過程可以分為幾個主要階段：首先是 Coming Soon 頁面的建立和品牌視覺的完善，接著是 SpiceUSD 項目的適配工作，然後是 Pool 系統的開發，最後是點數系統與獎勵兌換功能的完整實現。同時，在整個過程中持續進行 UI/UX 改進、bug 修復、以及與上游 Liquity2 app 版本的同步。

---

## 初期工作：Coming Soon 頁面與品牌視覺 (2024年12月 - 2025年1月)

項目初期的工作主要集中在建立 Coming Soon 頁面和完善品牌視覺系統。2024年12月開始，首先進行了顏色系統的建立和更新，包括更新 HomePage 的顏色和標題，新增多種顏色配置，並在 2025年1月補充了缺失的顏色定義。同時更新了 Logo 組件，新增了 `ic-logo-defi-dollar.svg` 圖標文件。

2025年1月23日，完成了 Coming Soon 頁面的開發工作。這包括創建了 `app/coming-soon/index.html` 頁面，新增了所有必要的 favicon 相關文件（包括 16x16、32x32、192x192、512x512 等多種尺寸），以及 apple-touch-icon 和 site.webmanifest 文件。在 layout 中整合了 favicon，並在 Coming Soon 頁面底部添加了品牌資訊。

為了支持部署，在 2024年12月24日新增了 Firebase 部署配置，包括 `.firebaserc` 和 `firebase.json` 文件，並更新了 `.gitignore` 以排除不必要的文件。後續還進行了 Firebase hosting 配置的修復工作。

---

## SpiceUSD 項目適配 (2025年1月 - 2月)

從 2025年1月開始，進行了 SpiceUSD 項目的適配工作。這是一個基於 Liquity2 框架但針對不同代幣（SPICE）的定制化項目。主要工作包括更新 BOLD token symbol 為 SPICE，更新 SpiceUSD 專用的環境變數配置，支援額外的 collaterals，以及更新相關的 token icons。

在功能層面，為了適配 SpiceUSD 的特殊需求，移除了 Stake 和 Leverage 頁面，移除了使用 collateral token 關閉 loan 的功能，移除了 loan mode switch，並防止應用載入 stake positions。這些調整都是為了簡化 SpiceUSD 項目的功能集。

在技術實現上，適配了 non-rebasing tokens 的處理，包括顯示非 rebasing tokens 的價格和餘額，適配 adjustTrove 的 amount params 以支持 nrERC20 tokens，以及修復了相關的價格報告和 decimal 處理問題。同時更新了 SUSD 圖標，並移除了 LQTY price 從 footer。

在這個階段，也進行了多次與上游 `frontend/aa-base` 分支的合併，以及合併了多個 Liquity2 app 版本標籤（v1.0.0、v1.0.2、v1.0.3），確保代碼庫與上游保持同步。

---

## Pool 系統開發 (2025年6月 - 7月)

2025年6月開始，進行了 Pool 系統的完整開發工作。這是一個重要的功能模塊，用於管理多種流動性池。

### Pool 基礎架構建立

首先建立了 Pool1 和 Pool2 的基礎結構，定義了 pool2 pools 的配置，提取了 pool 相關的常數到統一的配置文件中，並改進了 pool 配置結構以提高可維護性。接著整合了 pool1 合約的交互邏輯，以及 pool2 的數據獲取功能。

在 UI 層面，新增了 Pool2 的空狀態畫面，修復了 Pool2 Position 的載入錯誤，更新了 Pool2 的交易預覽功能，並移除了 Pool1 的 compounds 功能。為了更好地顯示價格信息，新增了 Pool1 LP token 的價格顯示功能，能夠顯示 USD 價值，改進了 position amount 的 fallback 處理，並更新了 pool symbols 的顯示。

### Pool2 獎勵系統

在 Pool2 獎勵系統方面，實現了獎勵的過濾和分解功能，能夠正確地顯示和計算不同來源的獎勵。設置了正確的連結和圖標到 pool 配置中，確保用戶能夠方便地導航到相關頁面。

在 7月份，進行了多次 pool 相關的更新，包括更新 Crv Pools 的配置，更新 USDFI 的合約地址，更新 pools 的整體配置，以及改進從合約獲取 deposit 值的方式。

### 新合約遷移

7月28日，進行了從舊合約到新合約的遷移工作。這是一個重要的里程碑，需要更新所有相關的合約地址和交互邏輯。隨後將 pool2 分支合併到新合約分支，確保所有功能在新合約上正常運行。

---

## 點數系統與獎勵兌換 (2025年7月 - 9月)

點數系統是整個項目中最複雜和最重要的功能模塊之一，從 7月開始開發，到 8月底基本完成，9月進行了最後的優化和修復。

### 點數系統基礎架構

7月初，首先建立了點數系統的基礎架構。新增了點數數據源，整合了從 `https://defi-dollar.github.io/stats/v2/userPoints/` 獲取用戶點數的 API。同時處理了 404 錯誤的情況，確保當用戶沒有點數數據時能夠優雅地處理。

7月23日，新增了點數排行榜功能，能夠顯示前 20 名用戶的點數排名。後續還添加了 ENS 名稱顯示功能，讓排行榜更加友好。同時更新了路由系統，將 `/pool0` 重命名為 `/point-rewards`，新增了路由基礎的 tabbing 功能，並在移動端菜單中添加了 "Rewards (Pool0)" 選項。

### 點數兌換功能實現

8月28日，完成了點數兌換功能的完整實現。這是整個點數系統的核心功能。實現包括：

新增了 `DefiSale.ts` ABI 文件（405 行），定義了與 DefiSale 合約交互的所有接口。新增了 `points-redemption-tree.ts` 文件，包含了用於 Merkle tree 驗證的數據結構。新增了 `RewardPoolProgress.tsx` 組件，用於顯示獎勵池的進度。新增了 `useCampaignState.ts` hook，用於管理活動的不同狀態（未開始、進行中、可兌換、已結束）。

更新了 `PointRedemption.tsx` 組件，實現了完整的兌換界面，包括選擇支付代幣（支援 USDC、frxUSD、BOLD、USDFI）、選擇兌換比例（25%、50%、75%、全部）、顯示兌換成本和餘額檢查等功能。更新了 `pointsClaimRewards.tsx` 交易流程，實現了兩步驟的交易：首先批准支付代幣，然後執行兌換。

在實現過程中，特別注意了不同 decimal 的 token 處理。USDC 使用 6 decimals，而其他代幣（frxUSD、BOLD、USDFI）使用 18 decimals。在 `useDefiSaleRedemptionCost` hook 中，正確地將合約返回的 cost 值標記為對應 payment token 的 decimals。在使用 `useErc20TokenBalance` 時，也正確傳入了 token 的 decimals，確保所有數值運算和比較都是基於正確的 decimal 精度。

### 活動狀態管理優化

8月29日，修復了一個重要的 bug：用戶會卡在 "active" CampaignState 的問題。這個問題導致用戶無法正常進行兌換操作。修復包括移除了 `InsufficientFundsModal.tsx` 組件，優化了 `useCampaignState.ts` 的邏輯，確保狀態轉換更加可靠。

9月4日，進行了活動日期的更新，包括更新活動日期和相關文字，延長活動日期以適應實際運營需求。同時更新了活動開始日期，並在 UI 上進行了相應的調整，包括更新結束狀態的布局，以及新增活動開始前的視圖。

---

## UI/UX 持續改進

在整個開發過程中，持續進行了 UI/UX 的改進工作。

### 布局修復與響應式設計

修復了多個布局問題，包括 EarnPositionSummary 的布局對齊問題，positions 在移動端的布局問題，以及 positions 在 actions 模式下的布局問題。更新了響應式設計（RWD）布局，確保在不同設備上都能正常顯示。

### 文字與內容優化

進行了大量的文字更新工作，包括移除 BorrowScreen 標題中的 "ETH" 字樣，更新 PointRewardsScreen 的相關文字，重命名 DUSD 為 USDFI 以保持一致性，以及更新各種 wording 以提升用戶體驗。

### 代幣圖標管理

更新了多個代幣的圖標，包括 YFI token（新增了 YEARN_TOKEN_BLUE_RGB.png），FRAX 圖標，AAVE token 圖標，以及修復了 BOLD token logo 的顯示問題。同時新增了多個代幣的配置，更新了 DeFi Dollars 相關的代幣配置，新增了 collToken decimals 的配置，並修復了 WBTC 的 decimals 和 price decimals 問題。

---

## 功能修復與代碼質量

### BOLD 字面值清理

8月18日，進行了大規模的 BOLD 字面值修復工作。在多個文件中替換了硬編碼的 "BOLD" 字串，改為使用常數或配置。這影響了多個文件，包括 `SboldPositionSummary.tsx`、`PositionCardSbold.tsx`、`PanelClaimRewards.tsx`、`SboldPoolScreen.tsx`、`claimBribes.tsx`、`sboldDeposit.tsx`、`sboldRedeem.tsx` 等。這個工作提高了代碼的可維護性，使得未來如果需要更改代幣符號時更加容易。

### 穩定性池修復

修復了多個穩定性池相關的問題，包括修復 StabilityPools 的排序邏輯，修復穩定性池的連結，修復穩定性池摘要的返回按鈕路徑，以及修復穩定性池 tab 的路徑問題。

### Earn 功能優化

修復了 earn position card 的連結問題，修復了 earn button 的連結，移除了 earn 頁面中的 tabs 以簡化界面，並在 earn pools 中停用了 SBOLD 功能。

### 其他修復

修復了 borrow tooltip 的顯示問題，修復了 collateral dropdown 的選擇邏輯，修復了 account button 被 points view 摺疊的問題，以及修復了 redemption proportion input 的布局問題。

---

## 數據整合與 Subgraph 更新

### Subgraph 版本更新

8月4日，進行了大規模的 subgraph 版本更新。這次更新涉及大量的 schema 變更（3270 行變更），需要更新所有相關的 GraphQL 查詢。同時也更新了 subgraph endpoint，並支持從本地 subgraph schema 構建，提高了開發效率。

### 數據源更新

更新了多個數據源的配置，包括更新 stats endpoint 的 URL，更新 DUNE url，以及更新 graphql schema 以匹配最新的合約結構。

---

## Onboarding 系統 (2025年6月)

6月份，整合了 Onboarding 系統，用於引導新用戶使用應用。使用了 `tos-onboard-provider` 套件，並在 7月1日更新到了 v1.0.3 版本。

重構了 OnboardProvider 組件，使其能夠從 props 獲取 wallet address，提高了組件的靈活性。修復了 onboarding modal 在更改帳戶後不關閉的問題，新增了 axios 套件用於 onboarding 相關的 API 調用，並優化了代碼以減少 arrow function 的創建，提高了性能。

---

## 版本同步與維護

### 上游版本合併

在整個開發過程中，持續與上游 Liquity2 app 保持同步，合併了多個版本標籤：
- @liquity2/app-v1.6.1 (2025-08-04)
- @liquity2/app-v1.6.0 (2025-08-04)
- @liquity2/app-v1.5.0 (2025-08-04)
- @liquity2/app-v1.4.0 (2025-08-04)
- @liquity2/app-v1.3.1 (2025-05-23)
- @liquity2/app-v1.2.0 (2025-03-05)
- @liquity2/app-v1.0.3 (2025-02-12)
- @liquity2/app-v1.0.2 (2025-02-06)
- @liquity2/app-v1.0.0 (2025-02-03)

同時也進行了多次分支合併，包括將 `frontend/aa-base` 合併到 `frontend/defi-dollar` 和 `frontend/spiceusd`，以及將 `feature/pool2` 合併到 `feature/pool2-new-contracts`。

### 構建與部署優化

修復了多個構建錯誤，包括 TypeScript 類型錯誤、依賴問題、以及 lint 錯誤。更新了環境變數配置，包括 DeFi Dollar 和 SpiceUSD 的專用配置，新增了 `NEXT_PUBLIC_COLL_NUM` 環境變數，修復了 Firebase hosting 和 deploy 配置。

### 代碼清理

進行了代碼清理工作，包括移除 legacy page，移除調試用的 console.log，註釋未使用的代碼，移除硬編碼的 "DEFI" 字面值，移除不必要的 UI 元素（如 LQTY price from footer，tokens prices from bottom bar），以及更新 Git 配置（添加 node_modules 到 .gitignore，Git-ignore .vscode 等）。

---

## 舊合約處理 (2025年10月)

10月13日，進行了舊合約的清理工作。這包括移除了 `_onboard.tsx` 文件，簡化了 `LegacyPositionsBanner.tsx` 組件，清理了 `liquity-utils.ts` 文件（移除了 222 行舊代碼），並更新了 graphql 和 token icons 以匹配新的合約結構。

---

## 技術架構與決策

### Decimal 處理策略

在整個開發過程中，特別注意了不同 decimal 的 token 處理。這是因為不同的 ERC20 代幣可能使用不同的 decimal 精度（例如 USDC 使用 6 decimals，而大多數代幣使用 18 decimals）。在實現點數兌換功能時，確保了所有數值運算都正確處理了 decimal 轉換：

- 在 `useDefiSaleRedemptionCost` hook 中，正確地將合約返回的 cost 值標記為對應 payment token 的 decimals
- 使用 `useErc20TokenBalance` 時，正確傳入 token 的 decimals
- 所有 Dnum 類型的數值運算都保持了正確的 decimal 精度

### 數據結構設計

使用了 Dnum 類型來處理所有數值運算，這是一個包含 [bigint, decimals] 的元組類型，能夠精確地表示任意精度的數值。在點數兌換功能中，正確處理了 Merkle tree 驗證，整合了多個數據源（Subgraph、API、合約），確保數據的一致性和準確性。

### 組件架構

採用了清晰的分層架構，分離了 UI 組件、業務邏輯和數據獲取層。使用 React Query 進行數據管理，實現了交易流程（Transaction Flows）模式，使得複雜的多步驟交易能夠清晰地組織和管理。

---

## 關鍵文件位置

### 點數系統
- `app/src/points-utils.ts` - 點數相關的工具函數，包括獲取用戶點數、計算獎勵等
- `app/src/points-redemption-tree.ts` - Merkle tree 數據，用於驗證用戶的兌換資格
- `app/src/screens/PointRewardsScreen/` - 點數獎勵頁面的所有組件
  - `PointRedemption.tsx` - 主要的兌換界面
  - `RewardPoolProgress.tsx` - 獎勵池進度顯示
  - `useCampaignState.ts` - 活動狀態管理 hook
- `app/src/tx-flows/pointsClaimRewards.tsx` - 點數兌換的交易流程實現
- `app/src/abi/DefiSale.ts` - DefiSale 合約的 ABI 定義

### Pool 系統
- `app/src/constants.ts` - Pool 配置常數，包括所有 pool 的地址、symbol 等
- `app/src/pool1-utils.ts` - Pool1 相關的工具函數
- `app/src/pool2-utils.ts` - Pool2 相關的工具函數

### Coming Soon
- `app/coming-soon/index.html` - Coming Soon 頁面的 HTML 文件
- `app/firebase.json` - Firebase 部署配置文件

---

## 注意事項與後續維護

### 重要注意事項

1. **Decimal 處理**：確保所有 token 的 decimals 正確配置在 `constants.ts` 中，特別是在新增新的支付代幣時。

2. **環境變數**：不同部署環境（DeFi Dollar、SpiceUSD）需要不同的 `.env` 配置，確保使用正確的環境變數文件。

3. **Subgraph**：需要定期更新 subgraph schema，特別是在合約升級後。可以使用 `pnpm build-graphql` 命令來更新生成的 GraphQL 代碼。

4. **合約地址**：新舊合約遷移時需要更新所有相關地址，包括在 `constants.ts` 和環境變數中的配置。

5. **版本合併**：定期合併上游 Liquity2 app 版本以獲取最新功能和修復。合併時需要注意解決衝突，特別是自定義功能的部分。

### 後續建議

1. **點數系統維護**：繼續維護點數系統的穩定性，監控兌換功能的運行情況，及時修復可能的問題。

2. **Pool 系統優化**：可以進一步優化 Pool 系統的性能，特別是數據獲取和緩存策略。

3. **錯誤處理**：完善錯誤處理和用戶反饋機制，提供更友好的錯誤提示和恢復建議。

4. **依賴更新**：定期更新依賴套件，特別是安全相關的更新。

5. **代碼質量**：繼續進行代碼清理工作，移除未使用的代碼，保持代碼庫的整潔。

6. **文檔完善**：建議補充更多的代碼註釋和文檔，特別是複雜的業務邏輯部分。

---

**文件生成時間**: 2025年1月  
**基於**: Git 提交記錄整理（共 246 個提交）  
**時間跨度**: 2024年12月 - 2025年11月
