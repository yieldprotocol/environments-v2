import { ethers, waffle } from 'hardhat'
import *  as hre from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { verify, mapToJson, jsonToMap } from '../shared/helpers'

import EmergencyBrakeArtifact from '../artifacts/@yield-protocol/utils-v2/contracts/utils/EmergencyBrake.sol/EmergencyBrake.json'
import { Timelock } from '../typechain/Timelock'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

const { deployContract } = waffle;

/**
 * @dev This script deploys the Cloak
 *
 * It takes as inputs the governance json address file, which is updated.
 * ROOT access to the Cloak is given to the Timelock.
 * `plan` access is given to the Timelock.
 */

(async () => {
/*    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
    });
    const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
    const [ ownerAcc ] = await ethers.getSigners();
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;

    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const ROOT = await timelock.ROOT()

    let cloak: EmergencyBrake
    if (governance.get('cloak') === undefined) {
        cloak = (await deployContract(ownerAcc, EmergencyBrakeArtifact, [ownerAcc.address, ownerAcc.address])) as EmergencyBrake // Give the planner and executor their roles once set up
        console.log(`[Cloak, '${cloak.address}'],`)
        verify(cloak.address, [ownerAcc.address, ownerAcc.address]) // Give the planner and executor their roles once set up

        governance.set('cloak', cloak.address)
        fs.writeFileSync('./output/governance.json', mapToJson(governance), 'utf8')
    } else {
        cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake
    }
    if (!(await cloak.hasRole(ROOT, timelock.address))) {
        await cloak.grantRole(ROOT, timelock.address); console.log(`cloak.grantRoles(ROOT, timelock)`)
        while (!(await cloak.hasRole(ROOT, timelock.address))) { }
    }
    
    // Give access to each of the governance functions to the timelock, through a proposal to bundle them
    // Revoke ROOT from the deployer
    const proposal : Array<{ target: string; data: string}> = []

    /* proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`cloak.revokeRole(ROOT, deployer)`) */

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

    // Propose, approve, execute
    const txHash = await timelock.hash(proposal); console.log(`Proposal: ${txHash}`)
    if ((await timelock.proposals(txHash)).state === 0) { await timelock.propose(proposal); console.log(`Proposed ${txHash}`) }
    while ((await timelock.proposals(txHash)).state < 1) { }
    if ((await timelock.proposals(txHash)).state === 1) { await timelock.approve(txHash); console.log(`Approved ${txHash}`) }
    while ((await timelock.proposals(txHash)).state < 2) { }
    if ((await timelock.proposals(txHash)).state === 2) { await timelock.execute(proposal); console.log(`Executed ${txHash}`) }
})()
