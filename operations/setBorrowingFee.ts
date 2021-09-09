import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, stringToBytes32, bytesToString } from '../shared/helpers'
import { WAD } from '../shared/constants'

import { Timelock } from '../typechain/Timelock'
import { Ladle } from '../typechain/Ladle'


/**
 * @dev This script sets the borrowing fee at the ladle
 *
 * It takes as inputs the governance and protocol json address files.
 */

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle

    const proposal : Array<{ target: string; data: string}> = []
    proposal.push({
        target: ladle.address,
        data: ladle.interface.encodeFunctionData('setFee', [WAD.div(100)])
    })
    console.log(`setFee(${WAD.div(100).toString()})`)

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()