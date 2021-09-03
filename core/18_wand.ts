import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { mapToJson, jsonToMap, verify } from '../shared/helpers'

import WandArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Wand.sol/Wand.json'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'
import { PoolFactory } from '../typechain/PoolFactory'
import { JoinFactory } from '../typechain/JoinFactory'
import { FYTokenFactory } from '../typechain/FYTokenFactory'
import { Wand } from '../typechain/Wand'

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
 * The Wand gets access to permissioned functions in the Cauldron, Ladle, Witch and Factories.
 * A plan is recorded in the Cloak to isolate the Witch from the Cauldron, Ladle, Witch and Factories.
 */

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;

    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc) as unknown as Witch
    const joinFactory = await ethers.getContractAt('JoinFactory', protocol.get('joinFactory') as string, ownerAcc) as unknown as JoinFactory
    const fyTokenFactory = await ethers.getContractAt('FYTokenFactory', protocol.get('fyTokenFactory') as string, ownerAcc) as unknown as FYTokenFactory
    const poolFactory = await ethers.getContractAt('PoolFactory', protocol.get('poolFactory') as string, ownerAcc) as unknown as PoolFactory
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake
    const ROOT = await timelock.ROOT()

    const wand = (await deployContract(ownerAcc, WandArtifact, [
        cauldron.address,
        ladle.address,
        witch.address,
        poolFactory.address,
        joinFactory.address,
        fyTokenFactory.address,
    ])) as Wand
    console.log(`[Wand, '${wand.address}'],`)
    verify(wand.address, [cauldron.address, ladle.address, witch.address, poolFactory.address, joinFactory.address, fyTokenFactory.address])
  
    protocol.set('wand', wand.address)
    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    await wand.grantRole(ROOT, timelock.address); console.log(`wand.grantRoles(ROOT, timelock)`)

    // Give access to each of the governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, revoke ROOT from the deployer
    // Orchestrate Wand to use the permissioned functions in Cauldron
    // Store a plan for isolating Cauldron from Witch
    const proposal : Array<{ target: string; data: string}> = []

    proposal.push({
        target: wand.address,
        data: wand.interface.encodeFunctionData('grantRoles', [
            [
                id(wand.interface, 'addAsset(bytes6,address)'),
                id(wand.interface, 'makeBase(bytes6,address)'),
                id(wand.interface, 'makeIlk(bytes6,bytes6,address,uint32,uint96,uint24,uint8)'),
                id(wand.interface, 'addSeries(bytes6,bytes6,uint32,bytes6[],string,string)'),
                id(wand.interface, 'point(bytes32,address)'),
            ],
            timelock.address
        ])
    })
    console.log(`wand.grantRoles(gov, timelock)`)

    proposal.push({
        target: wand.address,
        data: wand.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`wand.grantRole(ROOT, cloak)`)

    proposal.push({
        target: wand.address,
        data: wand.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`wand.revokeRole(ROOT, deployer)`)

    proposal.push({
        target: cauldron.address,
        data: cauldron.interface.encodeFunctionData('grantRoles', [
            [
                id(cauldron.interface, 'addAsset(bytes6,address)'),
                id(cauldron.interface, 'addSeries(bytes6,bytes6,address)'),
                id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
                id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
                id(cauldron.interface, 'setRateOracle(bytes6,address)'),
                id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
            ],
            wand.address
        ])
    })
    console.log(`cauldron.grantRoles(wand)`)

    proposal.push({
        target: ladle.address,
        data: ladle.interface.encodeFunctionData('grantRoles', [
            [
                id(ladle.interface, 'addJoin(bytes6,address)'),
                id(ladle.interface, 'addPool(bytes6,address)'),
            ],
            wand.address
        ])
    })
    console.log(`ladle.grantRoles(wand)`)

    proposal.push({
        target: witch.address,
        data: witch.interface.encodeFunctionData('grantRoles', [
            [
                id(witch.interface, 'setIlk(bytes6,uint32,uint64,uint128)')
            ],
            wand.address
        ])
    })
    console.log(`witch.grantRoles(wand)`)

    proposal.push({
        target: joinFactory.address,
        data: joinFactory.interface.encodeFunctionData('grantRoles', [
            [
                id(joinFactory.interface, 'createJoin(address)')
            ],
            wand.address
        ])
    })
    console.log(`joinFactory.grantRoles(wand)`)

    proposal.push({
        target: fyTokenFactory.address,
        data: fyTokenFactory.interface.encodeFunctionData('grantRoles', [
            [
                id(fyTokenFactory.interface, 'createFYToken(bytes6,address,address,uint32,string,string)')
            ],
            wand.address
        ])
    })
    console.log(`fyTokenFactory.grantRoles(wand)`)
    
    proposal.push({
        target: poolFactory.address,
        data: poolFactory.interface.encodeFunctionData('grantRoles', [
            [
                id(poolFactory.interface, 'createPool(address,address)'),
            ],
            wand.address
        ])
    })
    console.log(`poolFactory.grantRoles(wand)`)
    
    proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [wand.address,
            [
                {
                    contact: cauldron.address, signatures: [
                        id(cauldron.interface, 'addAsset(bytes6,address)'),
                        id(cauldron.interface, 'addSeries(bytes6,bytes6,address)'),
                        id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
                        id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
                        id(cauldron.interface, 'setRateOracle(bytes6,address)'),
                        id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
                    ]
                },
                {
                    contact: ladle.address, signatures: [
                        id(ladle.interface, 'addJoin(bytes6,address)'),
                        id(ladle.interface, 'addPool(bytes6,address)'),
                    ]
                },
                {
                    contact: witch.address, signatures: [
                        id(witch.interface, 'setIlk(bytes6,uint32,uint64,uint128)'),
                    ]
                },
                {
                    contact: joinFactory.address, signatures: [
                        id(joinFactory.interface, 'createJoin(address)'),
                    ]
                },
                {
                    contact: fyTokenFactory.address, signatures: [
                        id(fyTokenFactory.interface, 'createFYToken(bytes6,address,address,uint32,string,string)')
                    ]
                },
                {
                    contact: poolFactory.address, signatures: [
                        id(poolFactory.interface, 'createPool(address,address)'),
                    ]
                },
            ]
        ])
    })
    console.log(`cloak.plan(wand)`)

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)

})()