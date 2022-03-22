==== Add September Series ====
The deployment of September series will be done in two stages, days apart.

1. Deploy fyToken and pools using `deploySeptemberSeries.network.sh`
2. Activate series and roll strategies onto them using `activateSeptemberSeries.network.sh`

# How many fyToken?
To initialize the pools we pass in the amount of base tokens which is usally set to 100. The initialization process then mints equivalent amount of fyLPTokens. If we are rolling we need to skew the pool such that the ratio of virtual/base remains similar to the older pool. To skew the pool we call sellFYToken on the pool during the initialization process. To determine how many fyToken to sell we do the following:
1. Find the ratio of virtual/base of the pool getting matured
2. Find the x in the following equation such that the ratio is equal to virtual/base of previous pool
```
(100+x)     virtual
------- =  ---------
(100-x)      base
```
# How to determine whether rolling is successful
1. Check the ratio of virtual/base of the pool is similar to what was in the old pool
2. Check if the reserves of the new pool are close to the older pool