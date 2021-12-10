import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { orchestrateJoinFactoryProposal } from '../../fragments/core/factories/orchestrateJoinFactoryProposal'
import { orchestrateFYTokenFactoryProposal } from '../../fragments/core/factories/orchestrateFYTokenFactoryProposal'
import { orchestratePoolFactoryProposal } from '../../fragments/core/factories/orchestratePoolFactoryProposal'

import { Timelock, EmergencyBrake } from '../../../typechain'
import { JoinFactory, FYTokenFactory, PoolFactory } from '../../../typechain'
import { deployer, developer } from './newEnvironment.rinkeby.config'

/**
 * @dev This script orchestrates the Factories
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
  proposal = proposal.concat(await orchestrateJoinFactoryProposal(deployer as string, joinFactory, timelock, cloak))
  proposal = proposal.concat(await orchestrateFYTokenFactoryProposal(deployer as string, fyTokenFactory, timelock, cloak))
  proposal = proposal.concat(await orchestratePoolFactoryProposal(deployer as string, poolFactory, timelock, cloak))

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
