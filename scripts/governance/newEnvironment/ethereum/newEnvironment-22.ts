import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { orchestrateCauldronProposal } from '../../../fragments/core/orchestrateCauldronProposal'
import { orchestrateLadleProposal } from '../../../fragments/core/orchestrateLadleProposal'
import { orchestrateWitchProposal } from '../../../fragments/core/orchestrateWitchProposal'
import { orchestrateWandProposal } from '../../../fragments/core/orchestrateWandProposal'

import { Timelock, EmergencyBrake } from '../../../../typechain'
import { Cauldron, Ladle, Witch, Wand } from '../../../../typechain'
import { JoinFactory, FYTokenFactory, PoolFactory } from '../../../../typechain'
import { deployer, developer } from './newEnvironment.config'

/**
 * @dev This script orchestrates the Cauldron, Ladle, Witch and Wand
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw 'Only Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
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
  const wand = (await ethers.getContractAt(
    'Wand',
    protocol.get('wand') as string,
    ownerAcc
  )) as unknown as Wand

  const joinFactory = ((await ethers.getContractAt(
    'JoinFactory',
    protocol.get('joinFactory') as string,
    ownerAcc
  )) as unknown) as JoinFactory
  const fyTokenFactory = ((await ethers.getContractAt(
    'FYTokenFactory',
    protocol.get('fyTokenFactory') as string,
    ownerAcc
  )) as unknown) as FYTokenFactory
  const poolFactory = ((await ethers.getContractAt(
    'PoolFactory',
    protocol.get('poolFactory') as string,
    ownerAcc
  )) as unknown) as PoolFactory

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateCauldronProposal(deployer.get(chainId) as string, cauldron, timelock, cloak))
  proposal = proposal.concat(await orchestrateLadleProposal(deployer.get(chainId) as string, cauldron, ladle, timelock, cloak))
  proposal = proposal.concat(await orchestrateWitchProposal(deployer.get(chainId) as string, cauldron, witch, timelock, cloak))
  proposal = proposal.concat(await orchestrateWandProposal(deployer.get(chainId) as string, cauldron, ladle, wand, joinFactory, fyTokenFactory, poolFactory, timelock, cloak))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
