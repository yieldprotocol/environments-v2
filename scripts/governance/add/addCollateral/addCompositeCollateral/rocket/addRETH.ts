import { CAULDRON, CLOAK, COMPOSITE, LADLE, TIMELOCK, WITCH } from '../../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../../shared/helpers'
import {
  Cauldron__factory,
  Ladle__factory,
  Timelock__factory,
  EmergencyBrake__factory,
  Witch__factory,
  CompositeMultiOracle__factory,
} from '../../../../../../typechain'
import { addAsset } from '../../../../../fragments/assetsAndSeries/addAsset'
import { addIlkToSeries } from '../../../../../fragments/assetsAndSeries/addIlkToSeries'
import { makeIlk } from '../../../../../fragments/assetsAndSeries/makeIlk'
import { updateCompositePaths } from '../../../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSources } from '../../../../../fragments/oracles/updateCompositeSources'
import { grantRoot } from '../../../../../fragments/permissions/grantRoot'

const { developer, ilks, reth, protocol, governance, joins, newSeries, oraclePaths, oracleSources } = require(process
  .env.CONF!)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const witch = Witch__factory.connect(protocol().getOrThrow(WITCH)!, ownerAcc)
  const compositeOracle = CompositeMultiOracle__factory.connect(protocol().getOrThrow(COMPOSITE)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  // Update oracles
  proposal = proposal.concat(await updateCompositeSources(compositeOracle, oracleSources))
  proposal = proposal.concat(await updateCompositePaths(compositeOracle, oraclePaths))
  // Permissions
  proposal = proposal.concat(await grantRoot(joins.getOrThrow(reth.assetId), cloak.address))
  // Asset
  proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, reth, joins))
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
