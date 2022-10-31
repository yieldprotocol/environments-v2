# Witch Migration

The migration will happen in Arbitrum first, then on mainnet.

On a first stage, the Witch v2 will be deployed and configured to liquidate DAI-collateralized vaults. The Witch v2 will be instructed to not liquidated vaults owned by the Witch v1, but the reciprocal won't be enforced. I.e, Witch v1 will be able to seize vaults that Witch v2 is already auctioning.

Due to this, in this phase, Witch v2 bot operators should only execute single-transaction liquidations.

In a second phase, the limit for DAI auctions in Witch v1 will be dropped to zero, protecting Witch v2 from having its vaults taken away, and allowing it to run multi-block auctions.

In a third phase, the Witch v1 will be decommissioned, and all liquidations will run from Witch v2.