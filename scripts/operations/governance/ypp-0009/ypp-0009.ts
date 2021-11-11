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
  const path =
    hre.network.config.chainId == 42 ? '../../../../addresses/archive/rc12/' : '../../../../addresses/archive/mainnet/'
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const developerIfImpersonating = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)

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
