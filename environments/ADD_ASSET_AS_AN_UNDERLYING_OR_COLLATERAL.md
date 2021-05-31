Adding an asset as an underlying or collateral.

The instructions below that have the same numeral, but different literals are exclusive (one and only one of them need be executed).

1. Add the asset's address and bytes encoding in the assets.json output file.
2. In the shared/constants.ts file, export the token, following this pattern for USDC:
```export const USDC = ethers.utils.formatBytes32String('USDC').slice(0, 14)```
3. Import the token constant you defined previously in the environments/config.ts file.
4. If the asset is not already deployed on the protocol, add the asset in `assetIds` AND COMMENT ALL THE OTHER PREVIOUSLY DEPLOYED ASSETS.
5. a. If the asset is a base, add the asset in `baseIds` AND COMMENT ALL THE OTHER PREVIOUSLY DEPLOYED BASES.
5. b. If the asset is an ilk, add the asset in `ilkIds` AND COMMENT ALL THE OTHER PREVIOUSLY DEPLOYED ILKS.
6. a. If the asset is a base, add a series in `seriesId` having that asset as base and other asets as ilks AND COMMENT ALL THE OTHER PREVIOUSLY DEPLOYED SERIES.
6. b. If the asset is an ilk, add the ilk in one of the series of `seriesId` AND COMMENT ALL THE OTHER PREVIOUSLY DEPLOYED SERIES AND ALL THE OTHER PREVIOUSLY DEPLOYED ILKS IN THE CURRENTLY DEPLOYING SERIES.
7. Run `npx hardhat run ./environments/4_assets.ts --network localhost/kovan`
8. a. If the asset is a base, run `ADD_AS_ILK=false npx hardhat run ./environments/5_series.ts --network localhost/kovan`
8. b. If the asset is an ilk, run `ADD_AS_ILK=true npx hardhat run ./environments/5_series.ts --network localhost/kovan`

