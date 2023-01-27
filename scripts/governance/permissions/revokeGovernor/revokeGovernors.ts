import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import { revokeGovernors } from '../../../fragments/permissions/revokeGovernors'
import { Timelock, EmergencyBrake } from '../../../../typechain'
const { governorsToRevoke, developer } = require(process.env.CONF as string)

/**
 * @dev This script revokes governor privileges from one or more accounts.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

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

  let proposal = await revokeGovernors(timelock, cloak, governorsToRevoke)

  await propose(timelock, proposal, developer)
})()
