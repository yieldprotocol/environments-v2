import { ethers } from 'hardhat'
import { DAI, USDC } from '../../../../shared/constants'

import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { ERC20__factory } from '../../../../typechain'
import { sendTokensProposal } from '../../../fragments/emergency/sendTokens'

const { governance, developer, assets } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  // Contract instantiation
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  // Get dai and usdc token addressess
  const daiAddr = assets.get(DAI)
  const usdcAddr = assets.get(USDC)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Send tokens to dev account
  for (let tokenAddr of [daiAddr, usdcAddr]) {
    const token = ERC20__factory.connect(tokenAddr, timelock.signer)

    proposal = proposal.concat(
      await sendTokensProposal(timelock, [[tokenAddr, developer, await token.balanceOf(timelock.address)]])
    )
  }

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
