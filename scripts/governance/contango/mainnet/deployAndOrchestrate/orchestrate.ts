import {
  ACCUMULATOR,
  CLOAK,
  COMPOSITE,
  CONTANGO_CAULDRON,
  CONTANGO_LADLE,
  CONTANGO_WITCH,
  POOL_ORACLE,
  TIMELOCK,
  YIELD_SPACE_MULTI_ORACLE,
} from '../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import {
  AccumulatorMultiOracle__factory,
  Cauldron__factory,
  CompositeMultiOracle__factory,
  ContangoLadle__factory,
  ContangoWitch__factory,
  EmergencyBrake__factory,
  IOracle,
  PoolOracle__factory,
  Timelock__factory,
  YieldSpaceMultiOracle__factory,
} from '../../../../../typechain'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { makeBaseProposal } from '../../../../fragments/assetsAndSeries/makeBaseProposal'
import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { orchestrateCauldronProposal } from '../../../../fragments/core/orchestrateCauldronProposal'
import { orchestrateLadleProposal } from '../../../../fragments/core/orchestrateLadleProposal'
import { orchestrateWitchV2Fragment } from '../../../../fragments/core/orchestrateWitchV2Fragment'
import { orchestrateYieldSpaceMultiOracleProposal } from '../../../../fragments/oracles/orchestrateYieldSpaceMultiOracleProposal'
import { updateAccumulatorSourcesProposal } from '../../../../fragments/oracles/updateAccumulatorSourcesProposal'
import { updateCompositePathsProposal } from '../../../../fragments/oracles/updateCompositePathsProposal'
import { updateCompositeSourcesProposal } from '../../../../fragments/oracles/updateCompositeSourcesProposal'
import { updateYieldSpaceMultiOracleSourcesProposal } from '../../../../fragments/oracles/updateYieldSpaceMultiOracleSourcesProposal'
import { addSeriesProposal } from '../../../../fragments/witchV2/addSeriesProposal'
import { makeIlkProposal } from '../../../../fragments/witchV2/makeIlkProposal'
import { orchestrateContangoLadle } from '../../shared/orchestrateContangoLadle'

const {
  developer,
  deployer,
  protocol,
  external,
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
  bases,
  rateChiSources,
} = require(process.env.CONF!)

/**
 * @dev This script orchestrates the Cauldron, Ladle, Witch (and Wand?)
 */

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer as string)

  const contangoAddress = external.getOrThrow('contango')

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CONTANGO_CAULDRON), ownerAcc)
  const ladle = ContangoLadle__factory.connect(protocol.getOrThrow(CONTANGO_LADLE), ownerAcc)
  const witch = ContangoWitch__factory.connect(protocol.getOrThrow(CONTANGO_WITCH), ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK), ownerAcc)
  const compositeMultiOracle = CompositeMultiOracle__factory.connect(protocol.getOrThrow(COMPOSITE), ownerAcc)
  const accumulatorOracle = AccumulatorMultiOracle__factory.connect(protocol.getOrThrow(ACCUMULATOR), ownerAcc)
  const yieldSpaceMultiOracle = YieldSpaceMultiOracle__factory.connect(
    protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE),
    ownerAcc
  )
  const poolOracle = PoolOracle__factory.connect(protocol.getOrThrow(POOL_ORACLE), ownerAcc)

  // Build the proposal
  const proposal = [
    await orchestrateYieldSpaceMultiOracleProposal(deployer, yieldSpaceMultiOracle, timelock, cloak),
    await orchestrateCauldronProposal(deployer as string, cauldron, timelock, cloak),
    await orchestrateLadleProposal(deployer as string, cauldron, ladle, timelock, cloak),
    await orchestrateContangoLadle(contangoAddress, ladle, cloak),
    await orchestrateWitchV2Fragment(ownerAcc, timelock, cloak, cauldron, witch),
    await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsToAdd),
    await updateAccumulatorSourcesProposal(accumulatorOracle, rateChiSources),
    await updateYieldSpaceMultiOracleSourcesProposal(yieldSpaceMultiOracle, poolOracle, compositeSources, pools),
    await updateCompositeSourcesProposal(ownerAcc, compositeMultiOracle, compositeSources),
    await updateCompositePathsProposal(compositeMultiOracle, compositePaths),
    await addAssetProposal(ownerAcc, cauldron, ladle, assetsToAdd),
    await makeBaseProposal(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, witch, cloak, bases),
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
