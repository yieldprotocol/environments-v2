import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  Cauldron,
  CompositeMultiOracle,
  ContangoLadle,
  ContangoWitch,
  IOracle,
  OldEmergencyBrake,
  Timelock,
  YieldSpaceMultiOracle,
} from '../../../../typechain'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { orchestrateJoinProposal } from '../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePathsProposal'
import { updateCompositeSourcesProposal } from '../../../fragments/oracles/updateCompositeSourcesProposal'
import { updateYieldSpaceMultiOracleSourcesProposal } from '../../../fragments/oracles/updateYieldSpaceMultiOracleSourcesProposal'
import { addSeriesProposal } from '../../../fragments/witchV2/addSeriesProposal'
import { makeIlkProposal } from '../../../fragments/witchV2/makeIlkProposal'
import { AuctionLineAndLimit, SeriesToAdd } from '../../confTypes'

export async function orchestrateNewInstruments(
  ownerAcc: SignerWithAddress,
  cauldron: Cauldron,
  ladle: ContangoLadle,
  witch: ContangoWitch,
  cloak: OldEmergencyBrake,
  compositeMultiOracle: CompositeMultiOracle,
  yieldSpaceMultiOracle: YieldSpaceMultiOracle,
  assetsToAdd: [string, string, string][],
  compositeSources: Array<[string, string, string]>,
  compositePaths: [string, string, string[]][],
  pools: Map<string, string>,
  seriesToAdd: SeriesToAdd[],
  fyTokenDebtLimits: Array<[string, string, number, number, number, number]>,
  auctionLineAndLimits: AuctionLineAndLimit[],
  joins: Map<string, string>,
  seriesIlks: Array<[string, string[]]>
) {
  const promises = [
    orchestrateJoinProposal(ownerAcc, cloak, assetsToAdd),
    updateYieldSpaceMultiOracleSourcesProposal(yieldSpaceMultiOracle, compositeSources, pools),
    updateCompositeSourcesProposal(compositeMultiOracle, compositeSources),
    updateCompositePathsProposal(compositeMultiOracle, compositePaths),
    addAssetProposal(ownerAcc, cloak, cauldron, ladle, assetsToAdd),
    addSeriesProposal(ownerAcc, cauldron, ladle, witch, cloak, seriesToAdd, pools),
    makeIlkProposal(
      ownerAcc,
      cloak,
      compositeMultiOracle as unknown as IOracle,
      cauldron,
      witch,
      fyTokenDebtLimits,
      auctionLineAndLimits,
      joins
    ),
    addIlksToSeriesProposal(cauldron, seriesIlks),
  ]

  return Promise.all(promises).then((x) => x.flat(1))
}
