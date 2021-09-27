import { ethers, waffle } from 'hardhat'
import *  as hre from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { mapToJson, jsonToMap, verify } from '../shared/helpers'

import WitchArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Witch.sol/Witch.json'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'

import { Timelock } from '../typechain/Timelock'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

const { deployContract } = waffle;

/**
 * @dev This script deploys the Witch
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 * The Witch gets access to permissioned functions in the Cauldron.
 * A plan is recorded in the Cloak to isolate the Witch from the Cauldron.
 */

(async () => {
    /* await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
    });
    const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
    const [ ownerAcc ] = await ethers.getSigners();
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;

    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake
    const ROOT = await timelock.ROOT()

    let witch: Witch
    if (protocol.get('witch') === undefined) {
        witch = (await deployContract(ownerAcc, WitchArtifact, [cauldron.address, ladle.address])) as Witch
        console.log(`[Witch, '${witch.address}'],`)
        verify(witch.address, [cauldron.address, ladle.address])
        protocol.set('witch', witch.address)
        fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    } else {
        witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc) as Witch
    }
    if (!(await witch.hasRole(ROOT, timelock.address))) {
        await witch.grantRole(ROOT, timelock.address); console.log(`witch.grantRoles(ROOT, timelock)`)
        while (!(await witch.hasRole(ROOT, timelock.address))) { }
    }

    // Give access to each of the governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, revoke ROOT from the deployer
    // Orchestrate Witch to use the permissioned functions in Cauldron
    // Store a plan for isolating Cauldron from Witch
    const proposal : Array<{ target: string; data: string}> = []
    proposal.push({
        target: witch.address,
        data: witch.interface.encodeFunctionData('grantRoles', [
            [
                id(witch.interface, 'point(bytes32,address)'),
                id(witch.interface, 'setIlk(bytes6,uint32,uint64,uint128)'),
            ],
            timelock.address
        ])
    })
    console.log(`witch.grantRoles(gov, timelock)`)

    proposal.push({
        target: witch.address,
        data: witch.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`witch.grantRole(ROOT, cloak)`)

    proposal.push({
        target: witch.address,
        data: witch.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`witch.revokeRole(ROOT, deployer)`)

    proposal.push({
        target: cauldron.address,
        data: cauldron.interface.encodeFunctionData('grantRoles', [
            [
                id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')
            ],
            witch.address
        ])
    })
    console.log(`cauldron.grantRoles(witch)`)

    const plan = [
        {
            contact: cauldron.address, signatures: [
                id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')
            ]
        }
    ]

    proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [witch.address, plan])
    })
    console.log(`cloak.plan(witch): ${await cloak.hash(witch.address, plan)}`)

    // Propose, approve, execute
    const txHash = await timelock.hash(proposal); console.log(`Proposal: ${txHash}`)
    if ((await timelock.proposals(txHash)).state === 0) { await timelock.propose(proposal); console.log(`Proposed ${txHash}`) }
    while ((await timelock.proposals(txHash)).state < 1) { }
    if ((await timelock.proposals(txHash)).state === 1) { await timelock.approve(txHash); console.log(`Approved ${txHash}`) }
    while ((await timelock.proposals(txHash)).state < 2) { }
    if ((await timelock.proposals(txHash)).state === 2) { await timelock.execute(proposal); console.log(`Executed ${txHash}`) }
})()