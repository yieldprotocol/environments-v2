import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { verify, mapToJson, jsonToMap } from '../shared/helpers'

import RelayArtifact from '../artifacts/@yield-protocol/utils-v2/contracts/utils/Relay.sol/Relay.json'
import { Relay } from '../typechain/Relay'
import { Timelock } from '../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys a Relay.
 *
 * It takes as inputs the governance json address file, which is updated.
 */

// const multisig = fs.readFileSync('.multisig', 'utf8').trim();
const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const relay = (await deployContract(ownerAcc, RelayArtifact)) as unknown as Relay
    console.log(`[Relay, '${relay.address}'],`)
    verify(relay.address, [])

    governance.set('relay', relay.address)
    fs.writeFileSync('./output/governance.json', mapToJson(governance), 'utf8')

    // Give the relay full powers to the Timelock. ONLY FOR TESTING
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const proposal : Array<{ target: string; data: string}> = []

    proposal.push({
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('grantRole', [
            '0xca02753a', // propose,
            relay.address
        ])
    })
    proposal.push({
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('grantRole', [
            '0xa53a1adf', // approve
            relay.address
        ])
    })
    proposal.push({
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('grantRole', [
            '0xbaae8abf', // execute
            relay.address
        ])
    })
    console.log(`timelock.grantRoles(relay, all)`)

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()
