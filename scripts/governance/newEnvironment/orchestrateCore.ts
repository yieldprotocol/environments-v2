import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { orchestrateCauldronProposal } from '../../fragments/core/orchestrateCauldronProposal'
import { orchestrateLadleProposal } from '../../fragments/core/orchestrateLadleProposal'
import { orchestrateWitchProposal } from '../../fragments/core/orchestrateWitchProposal'

import { Timelock, EmergencyBrake } from '../../../typechain'
import { Cauldron, Ladle, Witch } from '../../../typechain'
const { deployer, developer } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the Cauldron, Ladle, Witch and Wand
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');

  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const witch = (await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as Witch

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateCauldronProposal(deployer as string, cauldron, timelock, cloak))
  proposal = proposal.concat(await orchestrateLadleProposal(deployer as string, cauldron, ladle, timelock, cloak))
  proposal = proposal.concat(await orchestrateWitchProposal(deployer as string, cauldron, witch, timelock, cloak))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
