/**
 * @dev This script updates the debt limits in the Cauldron.
 */

import { ethers } from 'hardhat'

import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { updateDebtLimits } from '../../../fragments/limits/updateDebtLimits'
import { Cauldron, Cauldron__factory, Timelock, Timelock__factory } from '../../../../typechain'
import { Ilk } from '../../confTypes'
import { CAULDRON, MULTISIG, TIMELOCK } from '../../../../shared/constants'

const { governance, protocol, developer, newLimits } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  // Contract instantiation
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)

  // Build the proposal
  /** This is the original code **/
  // let proposal: Array<{ target: string; data: string }> = []
  // proposal = proposal.concat(await updateDebtLimits(cauldron, newLimits))

  /* New code to handle Ilk type as updateDebtLimits() function argument */
  const proposal = await Promise.all(newLimits.map((ilk: Ilk) => updateDebtLimits(cauldron, ilk)))

  // Propose, Approve & execute
  await propose(timelock, proposal.flat(), governance.get(MULTISIG) as string)
})()
