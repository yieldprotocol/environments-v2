import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { verify, mapToJson, jsonToMap } from '../shared/helpers'

import RelayArtifact from '../artifacts/@yield-protocol/utils-v2/src/utils/Relay.sol/Relay.json'
import { Relay } from '../typechain/Relay'
import { Timelock } from '../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys a Relay.
 *
 * It takes as inputs the governance json address file, which is updated.
 */

// const multisig = fs.readFileSync('.multisig', 'utf8').trim();
const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const relay = (await deployContract(ownerAcc, RelayArtifact)) as unknown as Relay
  console.log(indent(nesting, `[Relay, '${relay.address}'],`))
  verify(relay.address, [])

  governance.set('relay', relay.address)
  fs.writeFileSync('./addresses/governance.json', mapToJson(governance), 'utf8')

  // Give the relay full powers to the Timelock. ONLY FOR TESTING
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: timelock.address,
    data: timelock.interface.encodeFunctionData('grantRoles', [
      [
        '0xca02753a', // propose,
        '0x013a652d', // proposeRepeated
        '0xa53a1adf', // approve
        '0xbaae8abf', // execute
        '0xf9a28e8b', // executeRepeated
      ],
      relay.address,
    ]),
  })
  console.log(indent(nesting, `timelock.grantRoles(relay, all)`))

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(indent(nesting, `Proposal: ${txHash}`))
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    console.log(indent(nesting, `Proposed ${txHash}`))
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash)
    console.log(indent(nesting, `Approved ${txHash}`))
  }
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    console.log(indent(nesting, `Executed ${txHash}`))
  }
})()
