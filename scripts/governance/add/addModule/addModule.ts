import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import { Ladle__factory, Timelock__factory } from '../../../../typechain'

import { orchestrateModuleProposal } from '../../../fragments/modules/orchestrateModuleProposal'

const { developer, governance, protocol, moduleAddress } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates a Module
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const moduleAddress = protocol.get('repayCloseModule') as string
  console.log(moduleAddress)

  const ladle = Ladle__factory.connect(protocol.get('ladle')!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.get('timelock')!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Module
  proposal = proposal.concat(await orchestrateModuleProposal(ladle, moduleAddress))

  await propose(timelock, proposal, developer)
})()
