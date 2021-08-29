import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap } from '../shared/helpers'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'
import { Wand } from '../typechain/Wand'
import { JoinFactory } from '../typechain/JoinFactory'
import { FYTokenFactory } from '../typechain/FYTokenFactory'
import { PoolFactory } from '../typechain/PoolFactory'
import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { CompositeMultiOracle } from '../typechain/CompositeMultiOracle'
import { CTokenMultiOracle } from '../typechain/CTokenMultiOracle'
import { EmergencyBrake } from '../typechain/EmergencyBrake'
import { Timelock } from '../typechain/Timelock'

/**
 * This script gives governance rights to the governor over the whole Yield v2 Protocol
 * 
 * run:
 * npx hardhat run ./environments/governance.ts --network localhost
 *
 */

console.time("Orchestration set in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  
    // Contract instantiation
    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc) as unknown as Witch
    const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const joinFactory = await ethers.getContractAt('JoinFactory', protocol.get('joinFactory') as string, ownerAcc) as unknown as JoinFactory
    const fyTokenFactory = await ethers.getContractAt('FYTokenFactory', protocol.get('fyTokenFactory') as string, ownerAcc) as unknown as FYTokenFactory
    const poolFactory = await ethers.getContractAt('PoolFactory', protocol.get('poolFactory') as string, ownerAcc) as unknown as PoolFactory
    const compoundOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as unknown as CompoundMultiOracle
    const chainlinkOracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc) as unknown as ChainlinkMultiOracle
    const compositeOracle = await ethers.getContractAt('CompositeMultiOracle', protocol.get('compositeOracle') as string, ownerAcc) as unknown as CompositeMultiOracle
    const cTokenOracle = await ethers.getContractAt('CTokenMultiOracle', protocol.get('cTokenOracle') as string, ownerAcc) as unknown as CTokenMultiOracle
    const cloak = await ethers.getContractAt('EmergencyBrake', protocol.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake

    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
  
    // Build the proposal
    const proposal : Array<{ target: string; data: string}> = []
  
    proposal.push({
        target: cauldron.address,
        data: cauldron.interface.encodeFunctionData('grantRoles', [
            [
                id(cauldron.interface, 'build(address,bytes12,bytes6,bytes6)'),
                id(cauldron.interface, 'destroy(bytes12)'),
                id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)'),
                id(cauldron.interface, 'give(bytes12,address)'),
                id(cauldron.interface, 'pour(bytes12,int128,int128)'),
                id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
                id(cauldron.interface, 'roll(bytes12,bytes6,int128)'),
            ],
            ladle.address
        ])
    })
    console.log(`cauldron.grantRoles(ladle)`)
  
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
        target: compoundOracle.address,
        data: compoundOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(compoundOracle.interface, 'setSource(bytes6,bytes6,address)'),
            ],
            wand.address
        ])
    })
    console.log(`compoundOracle.grantRoles(wand)`)
    
    proposal.push({
        target: chainlinkOracle.address,
        data: chainlinkOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(chainlinkOracle.interface, 'setSource(bytes6,bytes6,address)'),
            ],
            wand.address
        ])
    })
    console.log(`chainlinkOracle.grantRoles(wand)`)
    
    proposal.push({
        target: compositeOracle.address,
        data: compositeOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(compositeOracle.interface, 'setSource(bytes6,bytes6,address)'),
            ],
            wand.address
        ])
    })
    console.log(`compositeOracle.grantRoles(wand)`)
    
    proposal.push({
        target: cTokenOracle.address,
        data: cTokenOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(cTokenOracle.interface, 'setSource(bytes6,bytes6,address)'),
            ],
            wand.address
        ])
    })
    console.log(`cTokenOracle.grantRoles(wand)`)
    
    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)
    
    /* await cauldron.grantRole('0x00000000', cloak.address); console.log(`cauldron.grantRoles(cloak)`)
    await ladle.grantRole('0x00000000', cloak.address); console.log(`ladle.grantRoles(cloak)`)
    await witch.grantRole('0x00000000', cloak.address); console.log(`witch.grantRoles(cloak)`)
    await joinFactory.grantRole('0x00000000', cloak.address); console.log(`joinFactory.grantRoles(cloak)`)
    await fyTokenFactory.grantRole('0x00000000', cloak.address); console.log(`fyTokenFactory.grantRoles(cloak)`)
    await compoundOracle.grantRole('0x00000000', cloak.address); console.log(`compoundOracle.grantRoles(cloak)`)
    await chainlinkOracle.grantRole('0x00000000', cloak.address); console.log(`chainlinkOracle.grantRoles(cloak)`)
    await compositeOracle.grantRole('0x00000000', cloak.address); console.log(`compositeOracle.grantRoles(cloak)`)
    await cTokenOracle.grantRole('0x00000000', cloak.address); console.log(`cTokenOracle.grantRoles(cloak)`)

    await cloak.plan(ladle.address,
        [
            {
                contact: cauldron.address, signatures: [
                    id(cauldron.interface, 'build(address,bytes12,bytes6,bytes6)'),
                    id(cauldron.interface, 'destroy(bytes12)'),
                    id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)'),
                    id(cauldron.interface, 'give(bytes12,address)'),
                    id(cauldron.interface, 'pour(bytes12,int128,int128)'),
                    id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
                    id(cauldron.interface, 'roll(bytes12,bytes6,int128)'),
                ]
            }
        ]
    ); console.log(`cloak.plan(ladle)`)

    await cloak.plan(witch.address, 
        [
            {
                contact: cauldron.address, signatures: [
                    id(cauldron.interface, 'give(bytes12,address)'),
                    id(cauldron.interface, 'grab(bytes12,address)'),
                    id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')
                ]
            }
        ]
    ); console.log(`cloak.plan(witch)`)

    await cloak.plan(wand.address,
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
                    id(fyTokenFactory.interface, 'createFYToken(bytes6,address,address,uint32,string,string)'),
                ]
            },
            {
                contact: poolFactory.address, signatures: [
                    id(poolFactory.interface, 'createPool(address,address)'),
                ]
            },
            {
                contact: compoundOracle.address, signatures: [
                    id(compoundOracle.interface, 'setSource(bytes6,bytes6,address)'),
                ]
            },
            {
                contact: chainlinkOracle.address, signatures: [
                    id(chainlinkOracle.interface, 'setSource(bytes6,bytes6,address)'),
                ]
            },
            {
                contact: compositeOracle.address, signatures: [
                    id(compositeOracle.interface, 'setSource(bytes6,bytes6,address)'),
                ]
            },
            {
                contact: cTokenOracle.address, signatures: [
                    id(cTokenOracle.interface, 'setSource(bytes6,bytes6,address)'),
                ]
            },
        ]
    ); console.log(`cloak.plan(wand)`) */

    console.timeEnd("Orchestration set in")
})()