import { ACCUMULATOR, CAULDRON, CLOAK, COMPOSITE, LADLE, TIMELOCK, WITCH } from '../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import {
  Cauldron__factory,
  Ladle__factory,
  Timelock__factory,
  EmergencyBrake__factory,
  Witch__factory,
  CompositeMultiOracle__factory,
  Join__factory,
  AccumulatorMultiOracle__factory,
} from '../../../../../typechain'
import { addAsset } from '../../../../fragments/assetsAndSeries/addAsset'
import { addIlkToSeries } from '../../../../fragments/assetsAndSeries/addIlkToSeries'
import { makeIlk } from '../../../../fragments/assetsAndSeries/makeIlk'
import { orchestrateJoin } from '../../../../fragments/assetsAndSeries/orchestrateJoin'
import { updateAccumulatorSources } from '../../../../fragments/oracles/updateAccumulatorSources'

const {
  developer,
  ilks,
  spwsteth2304,
  spcdai2307,
  protocol,
  governance,
  joins,
  newSeries,
  oracleSources,
} = require(process.env.CONF!)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const witch = Witch__factory.connect(protocol().getOrThrow(WITCH)!, ownerAcc)
  const compositeOracle = CompositeMultiOracle__factory.connect(protocol().getOrThrow(COMPOSITE)!, ownerAcc)
  const accumulatorOracle = AccumulatorMultiOracle__factory.connect(protocol().getOrThrow(ACCUMULATOR)!, ownerAcc)
  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await updateAccumulatorSources(accumulatorOracle, oracleSources))
  proposal = proposal.concat(
    await orchestrateJoin(timelock, cloak, Join__factory.connect(joins.getOrThrow(spwsteth2304.assetId), ownerAcc))
  )
  proposal = proposal.concat(
    await orchestrateJoin(timelock, cloak, Join__factory.connect(joins.getOrThrow(spcdai2307.assetId), ownerAcc))
  )
  // Asset
  proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, spwsteth2304, joins))
  proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, spcdai2307, joins))
  for (let ilk of ilks) {
    proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joins))
  }
  // Add ilk to series Series
  for (let series of newSeries) {
    for (let ilk of series.ilks) {
      proposal = proposal.concat(await addIlkToSeries(cauldron, series, ilk))
    }
  }
  if (proposal.length > 0) await propose(timelock, proposal, developer)
})()
