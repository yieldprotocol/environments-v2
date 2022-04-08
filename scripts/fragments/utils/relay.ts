import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import RelayArtifact from '../../../artifacts/@yield-protocol/utils-v2/contracts/utils/Relay.sol/Relay.json'
import { Relay } from '../../../typechain'
import { jsonToMap, mapToJson, verify } from '../../../shared/helpers'

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
  console.log(`[Relay, '${relay.address}'],`)
  verify(relay.address, [])

  governance.set('relay', relay.address)
  fs.writeFileSync('./addresses/governance.json', mapToJson(governance), 'utf8')

  // Give the relay full powers to the Timelock. ONLY FOR TESTING
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
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
  console.log(`timelock.grantRoles(relay, all)`)

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    console.log(`Proposed ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash)
    console.log(`Approved ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    console.log(`Executed ${txHash}`)
  }
})()
