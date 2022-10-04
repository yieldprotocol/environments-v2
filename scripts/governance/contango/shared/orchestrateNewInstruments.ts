import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { makeIlkProposal } from '../../../fragments/witchV2/makeIlkProposal'
import { orchestrateJoinProposal } from '../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { updateCompositeSourcesProposal } from '../../../fragments/oracles/updateCompositeSourcesProposal'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePathsProposal'
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
} from '../../../../typechain'
import {
  ACCUMULATOR,
  CLOAK,
  COMPOSITE,
  CONTANGO_CAULDRON,
  CONTANGO_LADLE,
  CONTANGO_WITCH,
  MULTISIG,
  POOL_ORACLE,
  TIMELOCK,
  YIELD_SPACE_MULTI_ORACLE,
} from '../../../../shared/constants'
import { addSeriesProposal } from '../../../fragments/witchV2/addSeriesProposal'
import { orchestrateYieldSpaceMultiOracleProposal } from '../../../fragments/oracles/orchestrateYieldSpaceMultiOracleProposal'
import { updateYieldSpaceMultiOracleSourcesProposal } from '../../../fragments/oracles/updateYieldSpaceMultiOracleSourcesProposal'
import { makeBaseProposal } from '../../../fragments/assetsAndSeries/makeBaseProposal'

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
  bases,
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

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(CONTANGO_CAULDRON)!, ownerAcc)
  const ladle = ContangoLadle__factory.connect(protocol.get(CONTANGO_LADLE)!, ownerAcc)
  const witch = ContangoWitch__factory.connect(protocol.get(CONTANGO_WITCH)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)
  const compositeMultiOracle = CompositeMultiOracle__factory.connect(protocol.get(COMPOSITE)!, ownerAcc)
  const accumulatorOracle = AccumulatorMultiOracle__factory.connect(protocol.get(ACCUMULATOR)!, ownerAcc)
  const yieldSpaceMultiOracle = YieldSpaceMultiOracle__factory.connect(
    protocol.get(YIELD_SPACE_MULTI_ORACLE)!,
    ownerAcc
  )
  const poolOracle = PoolOracle__factory.connect(protocol.get(POOL_ORACLE)!, ownerAcc)

  const proposal = [
    await orchestrateYieldSpaceMultiOracleProposal(deployer, yieldSpaceMultiOracle, timelock, cloak), // This shouldn't be used in future rolls
    await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsToAdd),
    await updateYieldSpaceMultiOracleSourcesProposal(yieldSpaceMultiOracle, poolOracle, compositeSources, pools),
    await updateCompositeSourcesProposal(ownerAcc, compositeMultiOracle, compositeSources),
    await updateCompositePathsProposal(compositeMultiOracle, compositePaths),
    await addAssetProposal(ownerAcc, cauldron, ladle, assetsToAdd),
    await makeBaseProposal(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, witch, cloak, bases),
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

  await proposeApproveExecute(timelock, proposal, governance.get(MULTISIG)!, developer)
})()
