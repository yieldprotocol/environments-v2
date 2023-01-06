import {
  ACCUMULATOR,
  CLOAK,
  COMPOSITE,
  CONTANGO,
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
  IOracle,
  PoolOracle__factory,
  Timelock__factory,
  YieldSpaceMultiOracle__factory,
} from '../../../../../typechain'
import { OldEmergencyBrake__factory } from '../../../../../typechain/factories/contracts/OldEmergencyBrake.sol'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAsset'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeries'
import { makeBaseProposal } from '../../../../fragments/assetsAndSeries/makeBase'
import { orchestrateJoinProposal } from '../../../../fragments/core/removeDeployerRootToCloak'
import { orchestrateCauldronProposal } from '../../../../fragments/core/orchestrateCauldron'
import { orchestrateLadleProposal } from '../../../../fragments/core/orchestrateLadle'
import { orchestrateWitchV2Fragment } from '../../../../fragments/core/orchestrateWitch'
import { orchestrateYieldSpaceMultiOracleProposal } from '../../../../fragments/oracles/orchestrateYieldSpaceMultiOracle'
import { updateAccumulatorSourcesProposal } from '../../../../fragments/oracles/updateAccumulatorSources'
import { updateCompositePathsProposal } from '../../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSourcesProposal } from '../../../../fragments/oracles/updateCompositeSources'
import { updateYieldSpaceMultiOracleSourcesProposal } from '../../../../fragments/oracles/updateYieldSpaceMultiOracleSources'
import { addSeriesProposal } from '../../../../fragments/assetsAndSeries/addSeries'
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

  const contangoAddress = external.getOrThrow(CONTANGO)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CONTANGO_CAULDRON), ownerAcc)
  const ladle = ContangoLadle__factory.connect(protocol.getOrThrow(CONTANGO_LADLE), ownerAcc)
  const witch = ContangoWitch__factory.connect(protocol.getOrThrow(CONTANGO_WITCH), ownerAcc)
  const cloak = OldEmergencyBrake__factory.connect(governance.getOrThrow(CLOAK), ownerAcc)
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
    await orchestrateJoinProposal(ownerAcc, deployer, cloak, assetsToAdd),
    await updateAccumulatorSourcesProposal(accumulatorOracle, rateChiSources),
    await updateYieldSpaceMultiOracleSourcesProposal(yieldSpaceMultiOracle, poolOracle, compositeSources, pools),
    await updateCompositeSourcesProposal(ownerAcc, compositeMultiOracle, compositeSources, false),
    await updateCompositePathsProposal(compositeMultiOracle, compositePaths),
    await addAssetProposal(ownerAcc, cloak, cauldron, ladle, assetsToAdd),
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
