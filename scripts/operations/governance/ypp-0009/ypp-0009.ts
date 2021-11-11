/**
 * @dev This script updates the dust limits for one or more base/ilk pairs.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'

import { getOwnerOrImpersonate, jsonToMap, proposeApproveExecute } from '../../../../shared/helpers'

import { Cauldron } from '../../../../typechain/Cauldron'
import { Timelock } from '../../../../typechain/Timelock'

import { newMin } from './updateDust.config'
import { updateDustProposal } from '../../updateDustProposal'
;(async () => {
  const developerIfImpersonating = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])
  const linkAddress = new Map([
    [1, '0x514910771af9ca656af840dff83e8264ecf986ca'],
    [42, '0xe37c6209C44d89c452A422DDF3B71D1538D58b96'],
  ])

  let chainId: number

  // Because in forks the network name gets replaced by 'localhost' and chainId by 31337, we rely on checking known contracts to find out which chain are we on.
  if ((await ethers.provider.getCode(linkAddress.get(1) as string)) !== '0x') chainId = 1
  else if ((await ethers.provider.getCode(linkAddress.get(42) as string)) !== '0x') chainId = 42
  else throw 'Unrecognized chain'

  const path = chainId == 42 ? '../../../../addresses/archive/rc12/' : '../../../../addresses/archive/mainnet/'

  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)

  // Contract instantiation
  const cauldron = ((await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown) as Cauldron

  const timelock = ((await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown) as Timelock

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = await updateDustProposal(cauldron, newMin)
  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
