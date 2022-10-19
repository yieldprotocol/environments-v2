import { proposeApproveExecute, getOwnerOrImpersonate } from '../../../../../../shared/helpers'

import { NOTIONAL, MULTISIG, CAULDRON, LADLE, WITCH, CLOAK, TIMELOCK } from '../../../../../../shared/constants'

import { addFCashMaturitiesFragment } from '../../../../../fragments/other/notional/addFCashMaturitiesFragment'
import {
  Timelock__factory,
  EmergencyBrake__factory,
  NotionalMultiOracle__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
} from '../../../../../../typechain'

const { developer, deployer, governance, protocol, notionalAssets, newJoins } = require(process.env.CONF as string)

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const notionalOracle = NotionalMultiOracle__factory.connect(protocol.get(NOTIONAL)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.get(LADLE)!, ownerAcc)
  const witch = Witch__factory.connect(protocol.get(WITCH)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = await addFCashMaturitiesFragment(
    ownerAcc,
    deployer,
    timelock,
    cloak,
    notionalOracle,
    cauldron,
    ladle,
    witch,
    notionalAssets,
    newJoins
  )

  await proposeApproveExecute(timelock, proposal, governance.get(MULTISIG)!, developer)
})()
