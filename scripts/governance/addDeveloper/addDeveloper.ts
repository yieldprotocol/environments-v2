import { ethers } from 'hardhat'
import * as fs from 'fs'
import {
  getGovernanceProtocolAddresses,
  getOriginalChainId,
  getOwnerOrImpersonate,
  proposeApproveExecute,
} from '../../../shared/helpers'

import { grantDeveloperProposal } from '../../permissions/grantDeveloperProposal'
import { Timelock, EmergencyBrake } from '../../../typechain'

export const developerAddress = new Map([
  [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
  [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
])

/**
 * @dev This script gives developer privileges to an account.
 */
;(async () => {
  const account: string = '0x7ffB5DeB7eb13020aa848bED9DE9222E8F42Fd9A'

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
