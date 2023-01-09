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
  EmergencyBrake__factory,
  IOracle,
  PoolOracle__factory,
  Timelock__factory,
  YieldSpaceMultiOracle__factory,
} from '../../../../typechain'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAsset'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlkToSeries'
import { orchestrateJoinProposal } from '../../../fragments/core/removeDeployerRootToCloak'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSourcesProposal } from '../../../fragments/oracles/updateCompositeSources'
import { updateYieldSpaceMultiOracleSourcesProposal } from '../../../fragments/oracles/updateYieldSpaceMultiOracleSources'
import { addSeriesProposal } from '../../../fragments/assetsAndSeries/addSeries'
import { makeIlkProposal } from '../../../fragments/witchV2/makeIlkProposal'

const {
  developer,
  deployer,
  protocol,
  governance,
  assetsToAdd,
  fyTokenDebtLimits,
  seriesIlks,
  compositeSources,
  compositePaths,
  pools,
  joins,
  newJoins,
  auctionLineAndLimits,
} = require(process.env.CONF!)

/**
 * @dev This script configures the Yield Protocol to use fyTokens as collateral.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const allJoins = new Map<string, string>([...joins, ...newJoins])

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CONTANGO_CAULDRON), ownerAcc)
  const ladle = ContangoLadle__factory.connect(protocol.getOrThrow(CONTANGO_LADLE), ownerAcc)
  const witch = ContangoWitch__factory.connect(protocol.getOrThrow(CONTANGO_WITCH), ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK), ownerAcc)
  const compositeMultiOracle = CompositeMultiOracle__factory.connect(protocol.getOrThrow(COMPOSITE), ownerAcc)
  const yieldSpaceMultiOracle = YieldSpaceMultiOracle__factory.connect(
    protocol.getOrThrow(YIELD_SPACE_MULTI_ORACLE),
    ownerAcc
  )
  const poolOracle = PoolOracle__factory.connect(protocol.getOrThrow(POOL_ORACLE), ownerAcc)

  const proposal = [
    await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsToAdd),
    await updateYieldSpaceMultiOracleSourcesProposal(yieldSpaceMultiOracle, poolOracle, compositeSources, pools),
    await updateCompositeSourcesProposal(ownerAcc, compositeMultiOracle, compositeSources),
    await updateCompositePathsProposal(compositeMultiOracle, compositePaths),
    await addAssetProposal(ownerAcc, cauldron, ladle, assetsToAdd),
    await addSeriesProposal(ownerAcc, cauldron, ladle, witch, cloak, assetsToAdd, pools),
    await makeIlkProposal(
      ownerAcc,
      cloak,
      compositeMultiOracle as unknown as IOracle,
      cauldron,
      witch,
      fyTokenDebtLimits,
      auctionLineAndLimits,
      allJoins
    ),
    await addIlksToSeriesProposal(cauldron, seriesIlks),
  ].flat(1)

  await propose(timelock, proposal, developer)
})()
