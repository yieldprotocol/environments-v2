The Solvency contract is an on-chain check of the ETH value of assets in Joins minus the ETH value of fyToken series.

The functions in the contract need to be fed with the identifiers for the joins and series in scope, so that the appropriate oracles can be retrieved from the cauldron.

When dealing with mature fCash, the joins up to September 22 hold underlying instead. From December 22 and onwards they contain no assets after maturity.