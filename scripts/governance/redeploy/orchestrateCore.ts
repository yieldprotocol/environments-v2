import { ethers } from 'hardhat'
import { proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'
import { orchestrateCauldronProposal } from '../../fragments/core/orchestrateCauldronProposal'
import { orchestrateLadleProposal } from '../../fragments/core/orchestrateLadleProposal'
import { orchestrateWitchProposal } from '../../fragments/core/orchestrateWitchProposal'

const { protocol, governance } = require(process.env.CONF as string)
const { deployer, developer } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the Cauldron, Ladle, Witch and Wand
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateCauldronProposal(deployer as string, cauldron, timelock, cloak))
  proposal = proposal.concat(await orchestrateLadleProposal(deployer as string, cauldron, ladle, timelock, cloak))
  proposal = proposal.concat(await orchestrateWitchProposal(deployer as string, cauldron, witch, timelock, cloak))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
