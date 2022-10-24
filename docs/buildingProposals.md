
# Introduction

A governance action in the Yield Protocol often requires dozens of calls to different contracts. It would be impossible for any governance mechanism to sign off on dozens of individual calls for each governance action, so we batch all the calls for a governance action in a proposal.

To make building proposals easier, we have developed a number of common proposal building blocks, called fragments.

## Deploy
 - Deploy a contract, including verification and recording the address

## Orchestrate
 - Give permissions for contracts to call permissioned functions in other contracts
 - Give ROOT to the Timelock, and revoke ROOT from the deployer
 - Give ROOT to the Cloak
 - Register the orchestrations so they can be removed in emergencies - Call `cloak.plan`

### Orchestrate Test
 - Test ROOT permissions from a script
 - TODO: Formalize orchestrations in config file, and test deployment against it

## Add Asset
Adding an asset means storing its address in the Cauldron associated to a unique bytes6 id. From then the id can be used to refer to the asset across the protocol. Used for STETH.
 - Add asset to protocol - Call `cauldron.addAsset`.

### Add Asset Test
 - Call `cauldron.assets` and compare result

## Set Data Source on Oracle
Pre:
 - Deploy and orchestrate a spot oracle
 - Add Asset (at least twice)

Each oracle has its own interface to add sources, depending on the kind of data feeds it can serve.
 - Call `oracle.setSource`

### Set Data Source Test
 - Call `oracle.sources` and compare result
 - Call `oracle.peek` and compare result against reasonable bounds

## Set Path on Composite Oracle
Pre:
 - Set Data Source on Oracle (at least twice)

To combine data feeds between different oracles, we use the composite oracle.
 - Add the source oracle to the composite oracle - Call `compositeOracle.setSource`
 - Add paths to the composite oracle - Call `compositeOracle.setPath`

### Set Path Test
 - Call `oracle.sources` and compare result
 - Call `oracle.paths` and compare result
 - Call `oracle.peek` and compare result against reasonable bounds

## Add Collateral (Ilk)
Pre:
 - Set Data Source on Oracle for spot
 - Set Path on Composite Oracle (optional)
 - Add the asset.
 - Deploy a Join for the asset
 - Orchestrate the Ladle to `join` and `exit` on the asset Join

An asset becomes a collateral to a borrowable asset by entering in the Cauldron the data to calculate collateralization, which is the address of an IOracle contract to use as spot oracle, and a collateralization ratio. If liquidations are needed, the Witch should be configured as well.

 - Register the Join in the Ladle - Call `ladle.addJoin`
 - Set the spot oracle and collateralization ratio - Call `cauldron.setSpotOracle`
 - Set the borrowing limits - Call `cauldron.setDebtLimits`
 - Enable the Witch - Call `witch.setIlk` and allow the Witch to `exit` from the ilk Join

### Add Collateral Test
 - Call `ladle.joins` and compare the result
 - Call `cauldron.spotOracles` and compare the result
 - Call `cauldron.debt` and compare the result
 - Call `witch.ilks` and compare the result
 - Use `ladle.pour` to post and withdraw collateral
 - Borrowing can't be tested until series are added

Post:
After adding a collateral, we will often add it as an ilk for one or more series
 - Add Ilk to Series

## Add Underlying (Base)
Pre:
 - Set Data Source on Oracle for rate and chi
 - Add the asset.
 - Deploy a Join for the asset
 - Orchestrate the Ladle to `join` and `exit` on the asset Join

An asset becomes a borrowable asset by entering in the Cauldron the data to calculate borrowing and lending rates after maturity, which is the address of an IOracle contract. If liquidations are needed, the Witch should be configured as well.

 - Register the Join in the Ladle - Call `ladle.addJoin`
 - Add an underlying to the Cauldron - Call `cauldron.setLendingOracle`
 - Enable the Witch - Allow the Witch to `join` to the base Join

### Add Underlying Test
 - Call `ladle.joins` and compare the result
 - Call `cauldron.lendingOracles` and compare the result
 - Call `witch.hasRole` and compare the result
 - Borrowing can't be tested until series are added

Post:
After adding a borrowable asset, we will often (if not always) add series and strategies for it.
 - Add Series
 - Add Collateral
 - Add Strategies

## Add Series
Pre:
 - Add Underlying
 - Deploy fyToken
 - Deploy pools
 - Orchestrate fyToken
 - Orchestrate pools

In practice, a series is an fyToken contract and a pool contract.
 - Add series in Cauldron - Call `cauldron.addSeries`
 - Add pool in Ladle - Call `ladle.addPool` (this also adds the fyToken in the Ladle)
 - Init pool - Transfer assets to the pool and call `pool.init`
 - Add ilk to series - See below

Test:
 - Call `cauldron.series` and compare the result
 - Call `ladle.pools` and compare the result (pools)
 - Call `ladle.integrations` and compare the result (pools, fyToken)
 - Call `ladle.tokens` and compare the result (pools, fyToken)

### Add Series Test
 - Mint fyToken with underlying `fyToken.mintWithUnderlying`
 - For each ilk, borrow fyToken using `ladle.pour`
 - For each ilk, try borrowing below `dust` and above `line`
 - Repay debt with fyToken using `ladle.pour`
 - Repay debt with fyToken using `ladleRepayModule.repayFromLadle`
 - Add liquidity to pool using base and fyToken
 - Sell fyToken to pool
 - Buy base from pool
 - Add liquidity to pool using only base
 - Borrow base using `ladle.serve`
 - Repay debt with base using `ladle.repay`
 - Repay debt with base using `ladle.repayVault`
 - Remove liquidity to base and fyToken
 - Remove liquidity to base only
 - Repay debt after maturity with `ladle.close`
 - Redeem mature fyToken
 - For each ilk, liquidate a vault

Post:
After adding a series, we will either:
 - Release a Strategy
 - Or Roll Strategy

## Add Ilk to Series
Pre:
 - Add Collateral
 - Add Underlying
 - Add Series

Collateralization is determined as a triplet of underlying/collateral/series. By adding an ilk to a series we enable an existing underlying/collateral pair to be used with a given series.
 - Add ilks to series - Call `cauldron.addIlks`

### Add Ilk to Series Test:
 - Add Series Test

## Init Strategies
Pre:
 - Add Series
 - Deploy Strategies
 - Orchestrate Strategies
 - Orchestrate Roller (if using)

Strategies need to be initialized by transferring some initial funds and then instructing the stragegy to invest them in a pool
 - Set the next pool to invest in - Call `strategy.setNextPool`
 - Transfer funds to the strategy
 - Invest - Call `strategy.startPool`
 - Register the Strategy in the Ladle as a token and an integration

### Strategies Test
 - Invest in strategy
 - Divest from strategy
 - Roll strategy

## Roll Strategies
Pre:
 - Add series
 - Orchestrate Roller (if using)

By rolling a strategy, we instruct it to divest all its assets from the pool it is currently invested in, and put all the recovered assets in a different pool.
 - Divest - Call `strategy.endPool`
 - Set the next pool to invest in - Call `strategy.setNextPool`
 - Invest - Call `strategy.startPool`

Note that due to the complexity of rolling, we often use the Roller contract, in which you call `roller.roll` to do the previous three steps.

### Roll Strategies Test
 - Strategies Test

## Add Module
By adding a module to the Ladle, we extend its functionality
 - Add a module - Call `ladle.addModule`

### Add Module Test
 - Call `ladle.modules` and compare the result
 - Test the module functionality

## Add Developer
By adding developers, we give them `propose` and `execute` permissions on the Timelock, and `execute` permissions on the Cloak.

### Add Developer Test
 - Call `timelock.hasRole` and `cloak.hasRole` for each permission, and compare results
 - Alternatively, have the developers propose and execute a governance action, and isolate a contract

## Add Planner
By adding planners, we give them `plan`, `cancel` and `terminate` permissions on the Cloak.

### Add Planner Test
 - Call `cloak.hasRole` and compare the results.
 - Alternatively, have the planner add an isolation plan

## Add Governor
By adding governors, we give them `approve` permissions on the Timelock, and `execute`, `restore` and `revokeRole` permissions on the Cloak.

### Add Governor Test
 - Call `timelock.hasRole` and `cloak.hasRole` for each permission, and compare results
 - Alternatively, have the governor approve a governance action, isolate and restore a contract, and revoke the `cloak.execute` role from someone.

## Update Auctions
Pre:
 - Add Collateral
 - Add Underlying

From which point and how fast do the liquidations converge towards offering all the collateral is set in the Witch.
 
### Update Auctions Test
 - Call `witch.ilks`
 - Test liqudiations

## Update Limits
Pre:
 - Add Collateral
 - Add Underlying

The limits in the protocol are minimum debt per vault, and maximum protocol debt. In the Witch (v1) are minimum collateral per vault, and maximum concurrent collateral under auction.
 - Set limits in the Cauldron - Call `cauldron.setDebtLimits`
 - Set limits in the Witch - Call `witch.setIlk`

### Update Limits Test
 - Test borrowing to the new limits
 - Test auctions to the new limits