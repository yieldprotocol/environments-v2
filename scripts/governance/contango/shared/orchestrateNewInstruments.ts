import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { makeIlkProposal } from './makeIlkProposal'
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
  Timelock__factory,
} from '../../../../typechain'
import { contangoCauldron_key, contangoLadle_key, contangoWitch_key } from '../../../../shared/constants'
import { addSeriesProposal } from './addSeriesProposal'
import { makeBaseProposal } from './makeBaseProposal'

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

  const timelock = Timelock__factory.connect(governance.get('timelock')!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(contangoCauldron_key)!, ownerAcc)
  const ladle = ContangoLadle__factory.connect(protocol.get(contangoLadle_key)!, ownerAcc)
  const witch = ContangoWitch__factory.connect(protocol.get(contangoWitch_key)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get('cloak')!, ownerAcc)
  const compositeMultiOracle = CompositeMultiOracle__factory.connect(protocol.get('compositeOracle')!, ownerAcc)
  const accumulatorOracle = AccumulatorMultiOracle__factory.connect(protocol.get('accumulatorOracle')!, ownerAcc)

  const proposal = [
    await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsToAdd),
    await updateCompositeSourcesProposal(ownerAcc, compositeMultiOracle, compositeSources),
    await updateCompositePathsProposal(compositeMultiOracle, compositePaths),
    await addAssetProposal(ownerAcc, cauldron, ladle, assetsToAdd),
    await makeBaseProposal(ownerAcc, cloak, accumulatorOracle as unknown as IOracle, cauldron, witch, bases),
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

  await proposeApproveExecute(timelock, proposal, governance.get('multisig')!, developer)
})()
