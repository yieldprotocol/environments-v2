
# Introduction

Building and executing proposals out of fragments. Deploy then configure.

# Recipes

## Deploy
 - Deploy a contract, including verification and recording the address

## Orchestrate
 - Give permissions for contracts to call permissioned functions in other contracts.
 - Give ROOT to the Timelock, and revoke ROOT from the deployer.
 - Give ROOT to the Cloak, and register the orchestrations so they can be removed in emergencies.

## Add Asset
 - Call `cauldron.addAsset`. By itself just updated the asset registry tying an assetId to an address. Used for STETH.

## Add Collateral (Ilk)
 - Deploy and orchestrate a spot oracle (optional)
 - Add sources for the spot oracle (optional)
 - Add the spot oracle to the composite oracle (optional)
 - Add paths to the composite oracle (optional)
 - Deploy and orchestrate a Join for the asset.
 - Add the asset.
 - Set it as a valid collateral for borrowing a given underlying.
 - Set the spot oracle to calculate collateralization
 - Set the borrowing limits.

## Add Underlying (Base)
 - Deploy strategies
 - Deploy spot oracles (optional)
 - Deploy `chi` and `rate` oracles (optional)
 - Deploy a Join for the asset (optional)
 - Orchestrate spot oracles (optional)
 - Orchestrate `chi` and `rate` oracles (optional)
 - Orchestrate a Join for the asset (optional)
 - Orchestrate strategies, including registering them in the ladle.
 - Add sources for the spot oracles (optional)
 - Add the spot oracles to the composite oracle (optional)
 - Add paths to the composite oracle (optional)
 - Add sources for the `chi` and `rate` oracles (optional)
 - Add the asset (optional)
 - Set it as a borrowable asset by setting `chi` and `rate` oracles.
 - Add series (optional)
 - Init strategies (optional)

## Add Ilk to Series
 - Add ilks to series

## Add Series
 - Deploy fyToken
 - Deploy pools
 - Orchestrate fyToken
 - Orchestrate pools
 - Init pools
 - Add ilks to series (optional)

## Roll Strategies
 - Add series
 - Roll strategies

## Add Module

## Add Developer

## Add Governor

## Update Auctions

## Update Limits
