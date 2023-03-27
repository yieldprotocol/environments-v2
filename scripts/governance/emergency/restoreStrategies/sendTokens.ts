import { ethers } from 'hardhat'

import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { sendTokensProposal } from '../../../fragments/utils/sendTokens'

const { governance, developer, sendData } = require(process.env.CONF as string)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  // Contract instantiation
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Send tokens to dev funds recipient account
  proposal = proposal.concat(await sendTokensProposal(timelock, await sendData()))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
