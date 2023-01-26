import { propose, getOwnerOrImpersonate } from '../../../../../shared/helpers'

import { NOTIONAL, CAULDRON, LADLE, WITCH_V1, CLOAK, TIMELOCK } from '../../../../../shared/constants'

import { orchestrateNotionalJoin } from '../../../../fragments/other/notional/orchestrateNotionalJoin'
import { addNotionalJoin } from '../../../../fragments/other/notional/addNotionalJoin'
import { updateNotionalSources } from '../../../../fragments/oracles/updateNotionalSources'
import { addAsset } from '../../../../fragments/assetsAndSeries/addAsset'
import { makeIlk } from '../../../../fragments/assetsAndSeries/makeIlk'
import { addIlkToSeries } from '../../../../fragments/assetsAndSeries/addIlkToSeries'

import {
  Cauldron__factory,
  EmergencyBrake__factory,
  Ladle__factory,
  NotionalJoin__factory,
  NotionalMultiOracle__factory,
  Timelock__factory,
  Witch__factory,
} from '../../../../../typechain'

const { developer, protocol, governance, joins, newJoins, newSources, newIlks } = require(process.env.CONF as string)

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const notionalOracle = NotionalMultiOracle__factory.connect(protocol().get(NOTIONAL)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol().get(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().get(LADLE)!, ownerAcc)
  const witch = Witch__factory.connect(protocol().get(WITCH_V1)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []

  // Update NotionalMultiOracle
  proposal = proposal.concat(await updateNotionalSources(notionalOracle, newSources))

  // Orchestrate and add NotionalJoins
  for (let [assetId, joinAddress] of newJoins) {
    const join = NotionalJoin__factory.connect(joinAddress, ownerAcc)
    proposal = proposal.concat(await orchestrateNotionalJoin(timelock, cloak, join))
    proposal = proposal.concat(await addNotionalJoin(ownerAcc, cloak, ladle, assetId, join))
  }

  // Add fCash as assets and as ilks to series
  for (let [series, ilk] of newIlks) {
    proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, ilk.asset, joins))
    proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joins))
    proposal = proposal.concat(await addIlkToSeries(cauldron, series, ilk))
  }

  await propose(timelock, proposal, developer)
})()
