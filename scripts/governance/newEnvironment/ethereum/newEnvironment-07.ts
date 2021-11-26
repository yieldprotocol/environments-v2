import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { orchestrateCloakProposal } from '../../../fragments/core/governance/orchestrateCloakProposal'
import { Timelock, EmergencyBrake } from '../../../../typechain'
import { WAD } from '../../../../shared/constants'
import { deployer, developer } from './newEnvironment.config'

/**
 * @dev This script orchestratese the Cloak
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)

  const governance = readAddressMappingIfExists('governance.json');

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

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = await orchestrateCloakProposal(deployer.get(chainId) as string, timelock, cloak)

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
