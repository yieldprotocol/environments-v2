import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap, stringToBytes32, bytesToString } from '../../shared/helpers'

import { Join } from '../../typechain/Join'
import { Timelock } from '../../typechain/Timelock'
import { EmergencyBrake } from '../../typechain/EmergencyBrake'


/**
 * @dev This script gives ROOT access from all Joins to the Cloak
 *
 * It takes as inputs the governance and joins json address files.
 */

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;
    const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string,string>;

    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake
    const ROOT = await timelock.ROOT()

    const proposal : Array<{ target: string; data: string}> = []
    for (let assetId of joins.keys()) {
        const join = await ethers.getContractAt('Join', joins.get(assetId) as string, ownerAcc) as Join
        proposal.push({
            target: cloak.address,
            data: join.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
        })
        console.log(`join(${bytesToString(assetId)}).grantRole(ROOT, cloak)`)
    }

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()