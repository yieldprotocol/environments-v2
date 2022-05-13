import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  getOriginalChainId,
  getOwnerOrImpersonate,
  proposeApproveExecute,
} from '../../../shared/helpers'

import { grantDeveloperProposal } from '../../fragments/permissions/grantDeveloperProposal'
import { Timelock, EmergencyBrake } from '../../../typechain'
import { newDevelopers, developerToImpersonate } from './addDevelopers.mainnet.config'

/**
 * @dev This script gives developer privileges to one or more accounts.
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developerToImpersonate as string)

  const governance = readAddressMappingIfExists('governance.json')

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  let proposal: Array<{ target: string; data: string }> = []
  for (let dev of newDevelopers) {
    proposal = proposal.concat(await grantDeveloperProposal(timelock, cloak, dev))
  }

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
