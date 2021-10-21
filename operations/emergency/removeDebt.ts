/**
 * @dev This script cancels the debt from a number of vaults.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as hre from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap } from '../../shared/helpers'

import { Cauldron } from '../../typechain/Cauldron'
import { Timelock } from '../../typechain/Timelock'
import { Relay } from '../../typechain/Relay'

;(async () => {
  const vaultId = '0x3f9765c9a4601ff812bcff99'
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const debt = (await cauldron.balances(vaultId)).art

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRole', [
      id(cauldron.interface, 'pour(bytes12,int128,int128)'),
      timelock.address,
    ]),
  })
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('pour', [vaultId, 0, `-${debt}`]),
  })
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('revokeRole', [
      id(cauldron.interface, 'pour(bytes12,int128,int128)'),
      timelock.address,
    ]),
  })

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    while ((await timelock.proposals(txHash)).state < 1) {}
    console.log(`Proposed ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash)
    while ((await timelock.proposals(txHash)).state < 2) {}
    console.log(`Approved ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    while ((await timelock.proposals(txHash)).state > 0) {}
    console.log(`Executed ${txHash}`)
  }
})()
