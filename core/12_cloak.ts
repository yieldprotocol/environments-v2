import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { verify, mapToJson, jsonToMap } from '../shared/helpers'

import EmergencyBrakeArtifact from '../artifacts/@yield-protocol/utils-v2/contracts/utils/EmergencyBrake.sol/EmergencyBrake.json'
import { Timelock } from '../typechain/Timelock'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

const { deployContract } = waffle;

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;

    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const ROOT = await timelock.ROOT()

    const cloak = (await deployContract(ownerAcc, EmergencyBrakeArtifact, [ownerAcc.address, ownerAcc.address])) as EmergencyBrake // Give the planner and executor their roles once set up
    console.log(`[Cloak, '${cloak.address}'],`)
    verify(cloak.address, [ownerAcc.address, ownerAcc.address]) // Give the planner and executor their roles once set up

    governance.set('cloak', cloak.address)
    fs.writeFileSync('./output/governance.json', mapToJson(governance), 'utf8')
    await cloak.grantRole(ROOT, timelock.address); console.log(`cloak.grantRoles(ROOT, timelock)`)
    
    // Give access to each of the governance functions to the timelock, through a proposal to bundle them
    // Revoke ROOT from the deployer
    const proposal : Array<{ target: string; data: string}> = []

    proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('grantRoles', [
            [
                '0xde8a0667', // id(cloak.interface, 'plan(address,tuple[])'),
            ],
            timelock.address
        ])
    })
    console.log(`cloak.grantRoles(gov, timelock)`)

    proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`cloak.revokeRole(ROOT, deployer)`)

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)
})()
