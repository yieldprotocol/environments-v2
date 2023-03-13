import { propose, getOwnerOrImpersonate } from '../../../../../shared/helpers'

import { NOTIONAL, CAULDRON, LADLE, WITCH_V1, CLOAK, TIMELOCK } from '../../../../../shared/constants'

import { orchestrateNotionalJoin } from '../../../../fragments/other/notional/orchestrateNotionalJoin'
import { updateNotionalSources } from '../../../../fragments/oracles/updateNotionalSources'
import { addFCashAsset } from '../../../../fragments/other/notional/addFCashAsset'
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

const { developer, deployers, protocol, governance, joins, newJoins, newSources, newIlks } = require(process.env
  .CONF as string)

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const notionalOracle = NotionalMultiOracle__factory.connect(protocol.getOrThrow(NOTIONAL)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.getOrThrow(LADLE)!, ownerAcc)
  const witch = Witch__factory.connect(protocol.getOrThrow(WITCH_V1)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []

  // Update NotionalMultiOracle
  proposal = proposal.concat(await updateNotionalSources(notionalOracle, newSources))

  // Orchestrate NotionalJoins
  for (let joinAddress of newJoins) {
    const join = NotionalJoin__factory.connect(joinAddress, ownerAcc)
    proposal = proposal.concat(await orchestrateNotionalJoin(deployers.getOrThrow(joinAddress), timelock, cloak, join))
  }

  // Make fCash into assets, then ilks and add them to series
  for (let [series, ilk] of newIlks) {
    proposal = proposal.concat(await addFCashAsset(ownerAcc, cloak, cauldron, ladle, ilk.asset, joins))
    proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joins))
    proposal = proposal.concat(await addIlkToSeries(cauldron, series, ilk))
  }

  await propose(timelock, proposal, developer)
})()
