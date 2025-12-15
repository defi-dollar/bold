# 工作 Backlog

（這個檔案是透過 LLM 參考 git 生成，供未來參考及除錯）

本文件列出所有完成的工作項目，按時間順序和功能模塊組織。

**總提交數**: 246 個提交  
**時間跨度**: 2024年12月 - 2025年11月

---

## 2024年12月

### Coming Soon 頁面與品牌視覺

- [x] 更新標題和顏色 (2024-12-20)
- [x] 更新 Logo 組件，新增 `ic-logo-defi-dollar.svg` (2024-12-23)
- [x] 更新顏色系統 (2024-12-24)
- [x] 新增顏色配置 (2024-12-24)
- [x] 新增 Firebase 部署配置 (`.firebaserc`, `firebase.json`) (2024-12-24)
- [x] 更新 `.gitignore`，添加 node_modules (2024-12-24)
- [x] 取消追蹤 vscode settings (2024-12-24)
- [x] 還原 prettier 變更 (2024-12-24)

---

## 2025年1月

### Coming Soon 頁面完成

- [x] 新增缺失的顏色定義 (2025-01-03)
- [x] 更新標題漸層效果 (2025-01-10)
- [x] 新增 Coming Soon 頁面 (`app/coming-soon/index.html`) (2025-01-23)
- [x] 新增 favicon（多種尺寸：16x16, 32x32, 192x192, 512x512）(2025-01-23)
- [x] 新增 apple-touch-icon (2025-01-23)
- [x] 更新 `site.webmanifest` (2025-01-23)
- [x] 在 layout 中整合 favicon (2025-01-23)
- [x] 在 Coming Soon 頁面底部添加品牌資訊 (2025-01-23)

### SpiceUSD 項目適配

- [x] 支援額外的 collaterals 通過環境變數 (2025-01-17)
- [x] 新增 `NEXT_PUBLIC_COLL_NUM` 環境變數 (2025-01-17)
- [x] 移除 Stake 和 Leverage 頁面 (2025-01-17)
- [x] 移除使用 collateral token 關閉 loan 的功能 (2025-01-17)
- [x] 更新 token icons (2025-01-17)
- [x] 修復 info cards 的顏色 (2025-01-17)
- [x] 修復 Firebase hosting 配置 (2025-01-16)
- [x] 移除 loan mode switch (2025-01-18)
- [x] 防止應用載入 stake positions (2025-01-18)
- [x] 定義 BOLD symbol 為常數 (2025-01-18)
- [x] 更新 BOLD token symbol 為 SUSD (2025-01-18)
- [x] 顯示非 rebasing tokens 的價格和餘額 (2025-01-18)
- [x] 適配合約交互以支持 non-rebasing tokens (2025-01-21)
- [x] 更新 SUSD 圖標 (2025-01-21)
- [x] 移除 LQTY price from footer (2025-01-21)
- [x] 適配 adjustTrove 的 amount params 以支持 nrERC20 tokens (2025-01-22)
- [x] 修復應用持續要求批准 BOLD 的問題（即使 allowance > debt）(2025-01-22)
- [x] 修復 Price 類型錯誤 (2025-01-22)
- [x] 修復價格報告 (2025-01-19)
- [x] 修復從 subgraph 獲取的 deposit decimals (2025-01-19)
- [x] 顯示 "{collName} Price" 而不是 "ETH Price" (2025-01-20)
- [x] 移除關閉 loan from collateral 按鈕 (2025-01-24)
- [x] 移除 convert loan to multiply 功能 (2025-01-24)
- [x] 移除 dropdown border (2025-01-24)
- [x] 更新 wording (2025-01-24)
- [x] 批准 1.01x BOLD 而不是 1.1x (2025-01-24)
- [x] 還原關閉 loan with collateral 按鈕（恢復功能）(2025-02-03)
- [x] 修復 CollateralSymbolSchema (2025-02-03)
- [x] 修復 getApprovalAmount 和 getStERC20Amount 的參數 (2025-02-03)

---

## 2025年2月

### SpiceUSD 與版本合併

- [x] 合併 @liquity2/app-v1.0.0 到 frontend/aa-base (2025-02-03)
- [x] 合併 @liquity2/app-v1.0.2 到 frontend/aa-base (2025-02-06)
- [x] 移除 "ETH" 從 Borrow screen 標題 (2025-02-06)
- [x] 修復 BOLD literals (多次提交)
- [x] 合併 @liquity2/app-v1.0.3 到 frontend/aa-base (2025-02-12)
- [x] 新增 tokens (2025-02-12)
- [x] 修復 WBTC price decimals (2025-02-12)
- [x] 修復 build 錯誤 (2025-02-12)
- [x] 修復 collateralRatio (2025-02-12)
- [x] 修復 Firebase deploy 配置 (2025-02-12)
- [x] 移除 LQTY price from footer (2025-02-12)
- [x] 更新 wordings (2025-02-12)
- [x] 更新 .env for DeFi Dollar (2025-02-13)
- [x] 更新 .env for SpiceUSD (2025-02-13)
- [x] 更新 BOLD token symbol 為 SPICE (2025-02-13)
- [x] 更新 graphql schema (2025-02-13)
- [x] 修復 WBTC decimals (2025-02-13)
- [x] 修復 BOLD literal (2025-02-13)
- [x] 還原 BOLD token symbol 變更 (2025-02-14)

---

## 2025年3月

- [x] 修復 adjustTrove (2025-03-03)
- [x] 合併 @liquity2/app-v1.2.0 到 frontend/aa-base (2025-03-05)
- [x] 修復 BOLD literals (2025-03-05)
- [x] 移除 tokens prices from bottom bar (2025-03-05)

---

## 2025年4月

- [x] 修復 build (2025-04-02)
- [x] 合併 @liquity2/app-v1.2.0 到 frontend/spiceusd (2025-04-02)

---

## 2025年5月

- [x] 合併 @liquity2/app-v1.3.1 到 frontend/aa-base (2025-05-23)
- [x] 更新 stats endpoint (2025-05-27)
- [x] 隱藏 staking 從 Positions (2025-05-27)
- [x] 更新 DeFi Dollars 的 tokens (2025-05-27)
- [x] 新增 collToken decimals (2025-05-27)
- [x] 移除 legacy page (2025-05-27)
- [x] 更新 DeFi-Dollar 的 wording (2025-05-27)
- [x] 修復 BOLD literals (2025-05-27)

---

## 2025年6月

### Onboarding 系統

- [x] 新增 onboarding (2025-06-04)
- [x] 更新 doc links (2025-06-06)
- [x] 新增 axios 套件用於 onboarding (2025-06-06)
- [x] 修復 onboarding modal 在更改帳戶後不關閉 (2025-06-06)
- [x] 減少 arrow function 創建 (2025-06-06)
- [x] 重構 OnboardProvider (2025-06-20)
- [x] OnboardProvider 現在從 props 獲取 wallet address (2025-06-20)
- [x] 使用 tos-onboard-provider 套件 (2025-06-26)
- [x] Git-ignore .vscode (2025-06-26)

### Pool 系統開發

- [x] 新增 RestrictedPage (2025-06-02)
- [x] 新增 staking 頁面回來 (2025-06-02)
- [x] 停用 delegated interest rate (2025-06-03)
- [x] 更新 DUNE url (2025-06-03)
- [x] 按字母順序排序 branches (2025-06-03)
- [x] 新增 Pool1 Pool2 結構 (2025-06-10)
- [x] 定義 pool2 pools (2025-06-11)
- [x] 修復穩定性池 tab 路徑 (2025-06-12)
- [x] 修復穩定性池摘要返回按鈕路徑 (2025-06-12)
- [x] 整合 pool1 合約 (2025-06-13)
- [x] 整合 pool2 數據 (2025-06-14)
- [x] 新增 Pool2 空畫面 (2025-06-16)
- [x] 修復 Pool2 Position 載入錯誤 (2025-06-16)
- [x] 更新 Pool2 交易預覽 (2025-06-16)
- [x] 移除 Pool1 compounds (2025-06-16)
- [x] 新增 Pool1 LP token 價格，顯示 USD 價值 (2025-06-17)
- [x] 提取 pool 常數 (2025-06-17)
- [x] 改進 pool 配置結構 (2025-06-17)
- [x] 更新 pool symbols (2025-06-17)
- [x] 改進 position amount 的 fallback (2025-06-17)
- [x] 修復 borrow tooltip (2025-06-17)
- [x] 修復 collateral dropdown 選擇 (2025-06-17)
- [x] 更新 wordings (2025-06-17)
- [x] 修復 build，移除未使用的 imports (2025-06-17)
- [x] 設置正確的連結和圖標到 pool 配置 (2025-06-23)
- [x] 過濾和分解 pool2 獎勵 (2025-06-26)

---

## 2025年7月

### Pool 系統完成

- [x] 更新 `tos-onboard-provider` 到 v1.0.3 (2025-07-01)
- [x] 修復 positions 布局在移動端 (2025-07-01)
- [x] 修復 positions 布局在 actions 模式 (2025-07-01)
- [x] 新增 Pool0 screen (2025-07-01)
- [x] 新增 Rewards (Pool0) 到移動端菜單 (2025-07-03)
- [x] 新增 InsufficientFundsModal (2025-07-03)
- [x] 新增 Pool0 交易步驟 (2025-07-03)
- [x] 修復 redemption proportion input 布局 (2025-07-03)
- [x] 移除 "DEFI" literals (2025-07-03)
- [x] 添加底線到有 tooltips 的項目 (2025-07-03)
- [x] 更新 wording (2025-07-11)
- [x] 更新 RWD 布局 (2025-07-11)
- [x] 還原註釋 OnboardingProvider (2025-07-16)
- [x] 適配點數獎勵計劃 (2025-07-16)
- [x] 修復 lint 錯誤 (2025-07-16)
- [x] 更新路由 - /pool0 -> /point-rewards，新增路由基礎的 tabbing (2025-07-23)
- [x] 新增點數排行榜 (2025-07-23)
- [x] 修復 account button 被 points view 摺疊 (2025-07-23)
- [x] 修復連結到 points 頁面 (2025-07-24)
- [x] 重命名 names with pool0 to points (2025-07-25)
- [x] 新增點數數據源 (2025-07-25)
- [x] 更新 subgraph 版本 (2025-07-28)
- [x] 修復排行榜格式 (2025-07-28)
- [x] 更新 AAVE token 圖標 (2025-07-28)
- [x] 更新 wording (2025-07-28)
- [x] 更新 PointRewardsScreen wordings (2025-07-28)
- [x] 重命名 DUSD -> USDFI (2025-07-28)
- [x] 移除 console.log (2025-07-28)
- [x] 遷移到新合約 (2025-07-28)
- [x] 更新 Crv Pools (2025-07-29)
- [x] 更新 USDFI 地址 (2025-07-29)
- [x] 顯示 ENS 名稱在排行榜 (2025-07-29)
- [x] 新增活動開始前視圖 for point rewards screen (2025-07-29)
- [x] 修復 earn button 連結 (2025-07-29)
- [x] 合併 pool2 分支到新合約分支 (2025-07-29)
- [x] 更新 pools (2025-07-31)
- [x] 從合約獲取 deposit 值 (2025-07-31)
- [x] 顯示更新日期 (2025-07-31)
- [x] 新增 total supply 在底部欄 (2025-07-31)
- [x] 移除 Merkl logo (2025-07-31)
- [x] 更新 wordings (2025-07-31)
- [x] 更新 FRAX 圖標 (2025-07-31)
- [x] 更新活動開始日期 (2025-07-31)
- [x] 新增 POINT_SYSTEM_ENABLED 常數用於覆蓋點數數據 (2025-07-31)
- [x] 移除 tabs 在 earn 頁面 (2025-07-31)
- [x] 修復 earn position card 連結 (2025-07-31)
- [x] 註釋未使用的代碼 (2025-07-31)

---

## 2025年8月

### 點數兌換功能實現

- [x] 從本地 subgraph schema 構建 (2025-08-01)
- [x] 更新底部欄，新增 DEFI 價格 (2025-08-01)
- [x] 新增 docs 連結 (2025-08-01)
- [x] 修復 BOLD token logo 在 RedemptionInfo (2025-08-01)
- [x] 更新 about button (2025-08-01)
- [x] 更新 subgraph 版本（大量 schema 變更，3270 行）(2025-08-04)
- [x] 修復 build errors (2025-08-04)
- [x] 啟用點數系統 (2025-08-04)
- [x] 處理 404 錯誤 for point-system data (2025-08-04)
- [x] 在 earn pools 中停用 SBOLD (2025-08-04)
- [x] 修復穩定性池連結 (2025-08-04)
- [x] 新增 DEFI token 連結 (2025-08-04)
- [x] 修復 StabilityPools 排序 (2025-08-04)
- [x] 修復 EarnPositionSummary 布局對齊 (2025-08-04)
- [x] 移除 "ETH" 從 BorrowScreen 標題 (2025-08-04)
- [x] 合併 @liquity2/app-v1.4.0 到 frontend/defi-dollar (2025-08-04)
- [x] 合併 @liquity2/app-v1.5.0 到 frontend/defi-dollar (2025-08-04)
- [x] 合併 @liquity2/app-v1.6.0 到 frontend/defi-dollar (2025-08-04)
- [x] 合併 @liquity2/app-v1.6.1 到 frontend/defi-dollar (2025-08-04)
- [x] 更新 YFI token 圖標 (2025-08-05)
- [x] 修復 BOLD literals（多個文件）(2025-08-18)
- [x] 新增點數兌換功能 (2025-08-28)
  - [x] 新增 `DefiSale.ts` ABI (405 行)
  - [x] 新增 `points-redemption-tree.ts` - Merkle tree 驗證
  - [x] 新增 `RewardPoolProgress.tsx` 組件
  - [x] 新增 `useCampaignState.ts` hook
  - [x] 更新 `PointRedemption.tsx` - 完整兌換界面
  - [x] 更新 `pointsClaimRewards.tsx` - 交易流程
  - [x] 支援多種支付代幣（USDC 6 decimals, frxUSD, BOLD, USDFI 18 decimals）
- [x] 更新結束狀態布局 (2025-08-28)
- [x] 修復用戶卡在 "active" CampaignState 的問題 (2025-08-29)
  - [x] 移除 `InsufficientFundsModal.tsx`
  - [x] 優化 `useCampaignState.ts` 邏輯

---

## 2025年9月

### 點數系統優化

- [x] 修復 build error (2025-09-04)
- [x] 延長活動日期 (2025-09-04)
- [x] 更新活動日期和文字 (2025-09-04)

---

## 2025年10月

### 舊合約清理

- [x] 舊合約處理 (2025-10-13)
  - [x] 移除 `_onboard.tsx`
  - [x] 簡化 `LegacyPositionsBanner.tsx`
  - [x] 清理 `liquity-utils.ts` (移除 222 行)
  - [x] 更新 graphql 和 token icons

---

## 2025年11月

- [x] 更新 subgraph endpoint (2025-11-14)

---

## 技術改進與修復

### Decimal 處理

- [x] 系統從全部預設 18 decimals 變成支援 decimals 參數
- [x] 在 `useDefiSaleRedemptionCost` 中正確處理不同 decimal 的支付代幣
- [x] 在 `useErc20TokenBalance` 中正確傳入 token decimals
- [x] 新增 collToken decimals 配置
- [x] 修復 WBTC decimals 和 price decimals

### BOLD Literal 清理

- [x] 在多個文件中替換硬編碼的 "BOLD" 字串
  - [x] `SboldPositionSummary.tsx`
  - [x] `PositionCardSbold.tsx`
  - [x] `PanelClaimRewards.tsx`
  - [x] `SboldPoolScreen.tsx`
  - [x] `claimBribes.tsx`
  - [x] `sboldDeposit.tsx`
  - [x] `sboldRedeem.tsx`

### 穩定性池修復

- [x] 修復 StabilityPools 排序邏輯
- [x] 修復穩定性池連結
- [x] 修復穩定性池摘要返回按鈕路徑
- [x] 修復穩定性池 tab 路徑

### Earn 功能優化

- [x] 修復 earn position card 連結
- [x] 修復 earn button 連結
- [x] 移除 earn 頁面中的 tabs
- [x] 在 earn pools 中停用 SBOLD

### 其他修復

- [x] 修復 borrow tooltip
- [x] 修復 collateral dropdown 選擇
- [x] 修復 account button 被 points view 摺疊
- [x] 修復 redemption proportion input 布局
- [x] 修復 adjustTrove
- [x] 修復 collateralRatio
- [x] 修復價格報告
- [x] 修復從 subgraph 獲取的 deposit decimals

---

## 版本合併記錄

- [x] 合併 @liquity2/app-v1.0.0 (2025-02-03)
- [x] 合併 @liquity2/app-v1.0.2 (2025-02-06)
- [x] 合併 @liquity2/app-v1.0.3 (2025-02-12)
- [x] 合併 @liquity2/app-v1.2.0 (2025-03-05)
- [x] 合併 @liquity2/app-v1.3.1 (2025-05-23)
- [x] 合併 @liquity2/app-v1.4.0 (2025-08-04)
- [x] 合併 @liquity2/app-v1.5.0 (2025-08-04)
- [x] 合併 @liquity2/app-v1.6.0 (2025-08-04)
- [x] 合併 @liquity2/app-v1.6.1 (2025-08-04)

---

## 代碼清理與維護

- [x] 移除 legacy page
- [x] 移除 console.log
- [x] 註釋未使用的代碼
- [x] 移除硬編碼的 "DEFI" 字面值
- [x] 移除 LQTY price from footer
- [x] 移除 tokens prices from bottom bar
- [x] 更新 Git 配置（添加 node_modules 到 .gitignore，Git-ignore .vscode）

---

## 重要注意事項

1. **"BOLD" literal 有被參數化** - 未來如果要 merge remote branch 要注意新的 BOLD literals

2. **系統由全部預設 18 decimals 變成支援 decimals 參數** - 未來有遇到交易數字相關問題要注意是否跟 decimals 有關

3. **環境變數** - 不同部署環境（DeFi Dollar、SpiceUSD）需要不同的 `.env` 配置

4. **Subgraph** - 需要定期更新 subgraph schema，特別是在合約升級後

5. **合約地址** - 新舊合約遷移時需要更新所有相關地址

---

**文件生成時間**: 2025年1月  
**基於**: Git 提交記錄整理

