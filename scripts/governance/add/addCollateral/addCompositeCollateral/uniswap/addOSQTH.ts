import { CAULDRON, CLOAK, LADLE, TIMELOCK, WITCH, UNISWAP, COMPOSITE } from '../../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../../shared/helpers'
import {
  Cauldron__factory,
  Ladle__factory,
  Join__factory,
  Timelock__factory,
  EmergencyBrake__factory,
  Witch__factory,
  UniswapV3Oracle__factory,
  CompositeMultiOracle__factory,
} from '../../../../../../typechain'
import { addAsset } from '../../../../../fragments/assetsAndSeries/addAsset'

import { addIlkToSeries } from '../../../../../fragments/assetsAndSeries/addIlkToSeries'
import { makeIlk } from '../../../../../fragments/assetsAndSeries/makeIlk'
import { orchestrateJoin } from '../../../../../fragments/assetsAndSeries/orchestrateJoin'
import { updateCompositePaths } from '../../../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSources } from '../../../../../fragments/oracles/updateCompositeSources'
import { updateUniswapSources } from '../../../../../fragments/oracles/updateUniswapSources'

const {
  developer,
  ilks,
  protocol,
  governance,
  joins,
  newSeries,
  uniswapsources,
  osqth,
  oracleSources,
  oraclePaths,
} = require(process.env.CONF!)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const witch = Witch__factory.connect(protocol().getOrThrow(WITCH)!, ownerAcc)
  const uniswapOracle = UniswapV3Oracle__factory.connect(protocol().getOrThrow(UNISWAP)!, ownerAcc)
  const compositeOracle = CompositeMultiOracle__factory.connect(protocol().getOrThrow(COMPOSITE)!, ownerAcc)
  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Asset
  proposal = proposal.concat(await updateUniswapSources(uniswapOracle, uniswapsources))
  proposal = proposal.concat(await updateCompositeSources(compositeOracle, oracleSources))
  proposal = proposal.concat(await updateCompositePaths(compositeOracle, oraclePaths))
  proposal = proposal.concat(
    await orchestrateJoin(timelock, cloak, Join__factory.connect(joins.getOrThrow(osqth.assetId), ownerAcc))
  )
  // Asset
  proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, osqth, joins))
  for (let ilk of ilks) {
    proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joins))
  }
  // Add ilk to series
  for (let series of newSeries) {
    for (let ilk of series.ilks) {
      proposal = proposal.concat(await addIlkToSeries(cauldron, series, ilk))
    }
  }
  if (proposal.length > 0) await propose(timelock, proposal, developer)
})()
