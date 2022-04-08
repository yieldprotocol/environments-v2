import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, bytesToString } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

/**
 * @dev This script gives ROOT access from all Joins to the Cloak
 *
 * It takes as inputs the governance and joins json address files.
 */
;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const joins = jsonToMap(fs.readFileSync('./addresses/joins.json', 'utf8')) as Map<string, string>

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)

  const proposal: Array<{ target: string; data: string }> = []
  for (let assetId of joins.keys()) {
    const join = await ethers.getContractAt('Join', joins.get(assetId) as string, ownerAcc)
    proposal.push({
      target: cloak.address,
      data: join.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
    })
    console.log(`join(${bytesToString(assetId)}).grantRole(ROOT, cloak)`)
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
