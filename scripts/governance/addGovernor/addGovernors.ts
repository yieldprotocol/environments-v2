import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  getOriginalChainId,
  getOwnerOrImpersonate,
  proposeApproveExecute,
} from '../../../shared/helpers'

import { grantGovernorProposal } from '../../fragments/permissions/grantGovernorProposal'
import { Timelock, EmergencyBrake } from '../../../typechain'
import { newGovernors, developerToImpersonate } from './addGovernors.rinkeby.config'

/**
 * @dev This script gives governor privileges to one or more accounts.
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
  for (let gov of newGovernors) {
    proposal = proposal.concat(await grantGovernorProposal(timelock, cloak, gov))
  }

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
