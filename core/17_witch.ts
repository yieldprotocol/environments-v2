import { ethers, waffle } from 'hardhat'
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
 * This script deploys the SafeERC20Namer and YieldMath libraries
 */

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;

    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake
    const ROOT = await timelock.ROOT()

    const witch = (await deployContract(ownerAcc, WitchArtifact, [cauldron.address, ladle.address])) as Witch
    console.log(`[Witch, '${witch.address}'],`)
    verify(witch.address, [cauldron.address, ladle.address])
    protocol.set('witch', witch.address)
    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    await witch.grantRole(ROOT, timelock.address); console.log(`witch.grantRoles(ROOT, timelock)`)

    // Give access to each of the governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, revoke ROOT from the deployer
    // Orchestrate Witch to use the permissioned functions in Cauldron
    // Store a plan for isolating Cauldron from Witch
    const proposal : Array<{ target: string; data: string}> = []
    proposal.push({
        target: witch.address,
        data: witch.interface.encodeFunctionData('grantRoles', [
            [
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
                id(cauldron.interface, 'give(bytes12,address)'),
                id(cauldron.interface, 'grab(bytes12,address)'),
                id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')
            ],
            witch.address
        ])
    })
    console.log(`cauldron.grantRoles(witch)`)

    proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [witch.address,
            [
                {
                    contact: cauldron.address, signatures: [
                        id(cauldron.interface, 'give(bytes12,address)'),
                        id(cauldron.interface, 'grab(bytes12,address)'),
                        id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')
                    ]
                }
            ]
        ])
    })
    console.log(`cloak.plan(witch)`)

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)

})()