# ETH NotionalJoin Migration

The migration will happen on mainnet only.

1. The fixed NotionalJoin contracts will be deployed and orchestrated.
2. Then the funds from the broken NotionalJoin contracts will be transferred using `exit` on the old Join, and `join` on the new Join.