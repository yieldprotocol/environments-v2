import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { revokeGovernorProposal } from '../../permissions/revokeGovernorProposal'
import { Timelock, EmergencyBrake } from '../../../typechain'

/**
 * @dev This script revokes the governor privileges from the deployer account.
 */

;(async () => {
  const deployer: string = '0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708'

  const chainId = await getOriginalChainId()
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>

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

  let proposal = await revokeGovernorProposal(timelock, cloak, deployer)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
