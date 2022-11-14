# EmergencyBrake Migration

The migration will happen in Arbitrum first, then on mainnet.

The v1 EmergencyBrake will lose the ROOT role in all contracts, that is enough to disable it, while also allowing it to be restored if necessary.

The v2 EmergencyBrake will get the ROOT role in all contracts, and then the plans will be added as detailed in the [orchestration docs](../../../../docs/orchestration.md).