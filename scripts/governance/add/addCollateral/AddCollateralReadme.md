# Steps to add a collateral

## Investigation

1. Find if there is a price oracle available which could be used. If not, create a new price oracle.
2. Find the standard the collateral is using and examine if there are any variations in the standard.
   1. Check if anything different is happening in the transfer functions
   2. Check if there is any rebasing or other special logic in the standard
3. Based on the standard choose a regular join or a custom join with modifications to support the deviation from the standard if any. Also, decide if we want to enable flash loans for the collateral & if yes we can choose to inherit `FlashJoin`.

## Configuration

1. Determine which bases & series we want add the collateral to.
2. Determine oracles required for the collateral & define configuration changes required for the same. For eg: we might have to create a new path on `CompositeOracle` or add a new oracle to the `ChainLinkMultioracle`.
3. Determine `collateralization`, `debtLimits` & `auctionLineAndLimits` for each base we want to support.

## Deployment

1. Deploy join & oracle if needed.
2. Orchestrate oracle.
3. Use `addIlk` fragment to add the collateral.
