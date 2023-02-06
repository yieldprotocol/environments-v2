import { ethers } from 'hardhat'
import { LADLE, REPAY_FROM_LADLE_MODULE, TIMELOCK } from '../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import { Ladle__factory, Timelock__factory } from '../../../../typechain'

import { orchestrateModuleProposal } from '../../../fragments/modules/orchestrateModuleProposal'

const { developer, governance, protocol } = require(process.env.CONF!)

/**
 * @dev This script orchestrates a Module
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const moduleAddress = protocol().getOrThrow(REPAY_FROM_LADLE_MODULE) as string

  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Module
  proposal = proposal.concat(await orchestrateModuleProposal(ladle, moduleAddress))

  await propose(timelock, proposal, developer)
})()
