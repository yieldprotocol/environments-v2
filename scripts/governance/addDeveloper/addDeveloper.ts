import { ethers } from 'hardhat'
import * as fs from 'fs'
import {
  getGovernanceProtocolAddresses,
  getOriginalChainId,
  getOwnerOrImpersonate,
  proposeApproveExecute,
} from '../../../shared/helpers'

import { grantDeveloperProposal } from '../../fragments/permissions/grantDeveloperProposal'
import { Timelock, EmergencyBrake } from '../../../typechain'

export const developerAddress = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [4, '0x09F41c916B5C2e26706fEbf7c4666d2afE57419A'],
  [42, '0x09F41c916B5C2e26706fEbf7c4666d2afE57419A'],
])

/**
 * @dev This script gives developer privileges to an account.
 */
;(async () => {
  const account: string = '0xE7aa7AF667016837733F3CA3809bdE04697730eF'

  const chainId = await getOriginalChainId()
  const [governance, _] = await getGovernanceProtocolAddresses(chainId)

  let ownerAcc = await getOwnerOrImpersonate(developerAddress.get(chainId) as string)

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

  let proposal = await grantDeveloperProposal(timelock, cloak, account)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
