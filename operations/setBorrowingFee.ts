import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as hre from 'hardhat'
import { jsonToMap } from '../shared/helpers'
import { WAD } from '../shared/constants'

import { Timelock } from '../typechain/Timelock'
import { Relay } from '../typechain/Relay'
import { Ladle } from '../typechain/Ladle'

/**
 * @dev This script sets the borrowing fee at the ladle
 *
 * It takes as inputs the governance and protocol json address files.
 */

;(async () => {
  const fee = WAD.div(31536000) // wei per token per second to maturity. 1% for one year to maturity
  /* await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
    });
    const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle

  const proposal: Array<{ target: string; data: string }> = []
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('setFee', [fee]),
  })
  console.log(`setFee(${fee.toString()})`)

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
