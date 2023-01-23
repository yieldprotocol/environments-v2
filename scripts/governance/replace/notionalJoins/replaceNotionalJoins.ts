import { propose, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { CAULDRON, LADLE, CLOAK, TIMELOCK } from '../../../../shared/constants'

import { orchestrateNotionalJoinProposal } from '../../../fragments/other/notional/addNotionalJoin'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAsset'
import { drainJoinsFragment } from '../../../fragments/emergency/drainJoinsFragment'

import { Cauldron__factory, OldEmergencyBrake__factory, Ladle__factory, Timelock__factory } from '../../../../typechain'

const { developer, deployer, protocol, governance, newJoins, newAssets, joinReplacements } = require(process.env
  .CONF as string)

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cloak = OldEmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol().get(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().get(LADLE)!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateNotionalJoinProposal(ownerAcc, deployer, cloak, newJoins))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cloak, cauldron, ladle, newAssets))
  proposal = proposal.concat(await drainJoinsFragment(ownerAcc, timelock, ladle, joinReplacements))

  await propose(timelock, proposal, developer)
})()
