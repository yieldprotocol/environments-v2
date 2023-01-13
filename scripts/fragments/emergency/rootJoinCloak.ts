import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, getName } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import { Join } from '../../../typechain/Join'
import { Timelock } from '../../../typechain/Timelock'
import { EmergencyBrake } from '../../../typechain/EmergencyBrake'

/**
 * @dev This script gives ROOT access from all Joins to the Cloak
 *
 * It takes as inputs the governance and joins json address files.
 */
;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const joins = jsonToMap(fs.readFileSync('./addresses/joins.json', 'utf8')) as Map<string, string>

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

  const proposal: Array<{ target: string; data: string }> = []
  for (let assetId of joins.keys()) {
    const join = (await ethers.getContractAt('Join', joins.get(assetId) as string, ownerAcc)) as Join
    proposal.push({
      target: cloak.address,
      data: join.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
    })
    console.log(`join(${getName(assetId)}).grantRole(ROOT, cloak)`)
  }

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
