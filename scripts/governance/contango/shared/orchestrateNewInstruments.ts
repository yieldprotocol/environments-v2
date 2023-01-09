import {
  CLOAK,
  COMPOSITE,
  CONTANGO_CAULDRON,
  CONTANGO_LADLE,
  CONTANGO_WITCH,
  POOL_ORACLE,
  TIMELOCK,
  YIELD_SPACE_MULTI_ORACLE,
} from '../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import {
  Cauldron__factory,
  CompositeMultiOracle__factory,
  ContangoLadle__factory,
  ContangoWitch__factory,
  IOracle,
  OldEmergencyBrake__factory,
  PoolOracle__factory,
  Timelock__factory,
  YieldSpaceMultiOracle__factory,
} from '../../../../typechain'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { orchestrateJoinProposal } from '../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePathsProposal'
import { updateCompositeSourcesProposal } from '../../../fragments/oracles/updateCompositeSourcesProposal'
import { updateYieldSpaceMultiOracleSourcesProposal } from '../../../fragments/oracles/updateYieldSpaceMultiOracleSourcesProposal'
import { addSeriesProposal } from '../../../fragments/witchV2/addSeriesProposal'
import { makeIlkProposal } from '../../../fragments/witchV2/makeIlkProposal'

const {
  developer,
  protocol,
  governance,
  assetsToAdd,
  seriesToAdd,
  fyTokenDebtLimits,
  seriesIlks,
  compositeSources,
  compositePaths,
  pools,
  joins,
  auctionLineAndLimits,
} = require(process.env.CONF!)

/**
 * @dev This script configures the Yield Protocol to use fyTokens as collateral.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CONTANGO_CAULDRON), ownerAcc)
  const ladle = ContangoLadle__factory.connect(protocol.getOrThrow(CONTANGO_LADLE), ownerAcc)
  const witch = ContangoWitch__factory.connect(protocol.getOrThrow(CONTANGO_WITCH), ownerAcc)
  const cloak = OldEmergencyBrake__factory.connect(governance.getOrThrow(CLOAK), ownerAcc)
  const compositeMultiOracle = CompositeMultiOracle__factory.connect(protocol.getOrThrow(COMPOSITE), ownerAcc)
  const yieldSpaceMultiOracle = YieldSpaceMultiOracle__factory.connect(
    protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE),
    ownerAcc
  )
  const poolOracle = PoolOracle__factory.connect(protocol.getOrThrow(POOL_ORACLE), ownerAcc)

  const proposal = [
    await orchestrateJoinProposal(ownerAcc, cloak, assetsToAdd),
    await updateYieldSpaceMultiOracleSourcesProposal(yieldSpaceMultiOracle, poolOracle, compositeSources, pools),
    await updateCompositeSourcesProposal(compositeMultiOracle, compositeSources),
    await updateCompositePathsProposal(compositeMultiOracle, compositePaths),
    await addAssetProposal(ownerAcc, cloak, cauldron, ladle, assetsToAdd),
    await addSeriesProposal(ownerAcc, cauldron, ladle, witch, cloak, seriesToAdd, pools),
    await makeIlkProposal(
      ownerAcc,
      cloak,
      compositeMultiOracle as unknown as IOracle,
      cauldron,
      witch,
      fyTokenDebtLimits,
      auctionLineAndLimits,
      joins
    ),
    await addIlksToSeriesProposal(cauldron, seriesIlks),
  ].flat(1)

  await propose(timelock, proposal, developer)
})()
