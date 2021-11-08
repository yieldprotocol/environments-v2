import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { revokeGovernorProposal } from '../../permissions/revokeGovernorProposal'
import { Timelock, EmergencyBrake } from '../../../../typechain'

/**
 * @dev This script revokes the governor privileges from the deployer account.
 */

;(async () => {
  const deployer: string = '0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708'

  const developerIfImpersonating = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)

  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const cloak = (await ethers.getContractAt(
    'EmergencyBreak',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  let proposal = await revokeGovernorProposal(timelock, cloak, deployer)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
