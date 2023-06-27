# Proposal

Restore the June series (ETH, DAI, USDC, USDT) on mainnet, along with new June-December strategies. 

## Background

The June series are being restored to their state before the Euler hack with the funds recovered, which are slightly higher than the original amount.

## Details

The steps are:

1. Deploy new FYTokens and Non-tv pools.
2. Deploy new Strategies.
3. Governance proposal
   i. Orchestrate contracts
   ii. Add new series
   iii. Initialize June-Dec Strategies with $100 USD equivalent
   iv. Invest June-Dec strategies in the new June pools
   v. Sell a small amount of fyToken to the pools to set them to the ratio they were in at the time of the hack.
   vi. Transfer the recovered funds to the pools, including the euler bonus
   vii. Mint fyToken, pool and strategy tokens, keeping the latter in the Timelock

Scripts for [deployment & activation](https://github.com/yieldprotocol/environments-v2/blob/26ca42ccc9bd9a703c4fc8e093fe9936510862ec/scripts/governance/emergency/euler/restoreJunStrategies.sh) and with config for [deployment](https://github.com/yieldprotocol/environments-v2/blob/26ca42ccc9bd9a703c4fc8e093fe9936510862ec/scripts/governance/emergency/euler/restoreJunStrategies.deployments.ts) & [restoration](https://github.com/yieldprotocol/environments-v2/blob/26ca42ccc9bd9a703c4fc8e093fe9936510862ec/scripts/governance/emergency/euler/restoreJunStrategies.mint.config.ts).

# Testing

Pool and strategy harnesses run on [mainnet tenderly fork](https://dashboard.tenderly.co/Yield/v2/fork/ebe50cf1-8b36-4aa2-a4f6-cf7796b4c0a0)