# Handover

這裡會重點說明如何接手這個專案，重要得注意事項。

`backlog.md` 跟 `overview.md` 可以供 Debug 參考。

## Git

這個專案是 [Liquity](https://github.com/liquity/bold) 的 Fork。
一共有兩個我們的 fork 分支
- [DeFi-Dollar](https://github.com/defi-dollar/bold) `frontend/defi-dollar` branch
- [SpiceUSD](https://github.com/spiceusd-xyz/bold) `frontend/spiceusd` branch
（Spice USD 主要的差別在於 UI 及支援 rebasing tokens，而 DeFi Dollar 沒有 Rebasing tokens）

他們都共同建立在 `frontend/aa-base` branch 上。
（這個基礎 branch 主要負責把 `BOLD` 這個 literal 參數化）

這裡會重點說明 DeFi Dollar 的狀況，因為 SpiceUSD 已經終止開發。

## Merging remote

專案會不定時從 remote branch merge 回來，通常只會合併重大版本（[Liquity](https://github.com/liquity/bold)）的 Tags。
合併時通常會遇到大量的 `BOLD` literal Conflict 是正常的，
因為由於我們原先有兩個專案要 Rebrand，整個專案的所有 BOLD Literal 都被替換成 `BOLD_TOKEN_SYMBOL` 常數了 （`uikit/src/tokens.ts`）。

需要特別注意的是，由於官方可能新增更多頁面或更多 View 顯示 BOLD literal，這種情況不會出現 Conflict，必須手動 Global Search 找到這些 Literal 並且替換回我們的 `BOLD_TOKEN_SYMBOL` 常數。

## Decimal Points

由於官方的 Protocol 只支援了 18 decimals 的 token，這個專案其中一個的大改動就是支援 decimal 參數，定義在 （`uikit/src/tokens.ts`） 裡。
DeFi Dollar 目前非 18 decimal 的 collateral 為 `WBTC`。
所以付款相關的功能若有更動要特別注意 decimal 的問題，因為 **官方假設 Collaterals 是沒有 decimal 差別的**。


## Point System

這個專案新增的功能剩下 Point System（在 code 會看到 pool0, pool1, pool2，已經被棄用，所以可以不用理他們），point system 目前在一個倒數的階段，倒數完後 UI 會進入 Contract Redeem 的流程。
這個功能分散在幾個地方：
- `app/src/screens/PointRewardsScreen` 整個 UI 相關的邏輯都在這裡
- `app/src/points-utils.ts` Point 相關的資料抓取跟數字計算
- `app/src/tx-flows/pointsClaimRewards.tsx` 這個檔案管理實際 Redeem 的流程

倒數的設定在這裡：
- `app/src/screens/PointRewardsScreen/useCampaignState.ts`

## Firebase Config

`Firebase.json` 的這個參數非常重要 ```"cleanUrls": true```，若移除 routing 會出現問題

主要新增功能 point system, pool system, pool2 system

## 如何啟動

第一次執行時請先分別到 `app` 及 `uikit` 執行

```
pnpm install
```

 這個專案的 UI 有一部份建立在 uikit 裡面，所以第一次啟動及有更動時都要 run
```
pnpm build-deps   
```

然後啟動 app：
```
pnpm dev
```

由於 `build-deps` 會透過 subgraph schema 建立 subgraph 相關的 code，如果 subgraph shutdown 會無法 build。
Subgraph 的 endpoint 在 `.env` 的 `NEXT_PUBLIC_SUBGRAPH_URL` 裡面。

