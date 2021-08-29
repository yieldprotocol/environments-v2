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
 * This script gives ROOT access to the timelock for all contracts.
 */

const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;

console.time("Governance set in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc) as unknown as Witch
    const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const joinFactory = await ethers.getContractAt('JoinFactory', protocol.get('joinFactory') as string, ownerAcc) as unknown as JoinFactory
    const fyTokenFactory = await ethers.getContractAt('Wand', protocol.get('fyTokenFactory') as string, ownerAcc) as unknown as FYTokenFactory
    const poolFactory = await ethers.getContractAt('PoolFactory', protocol.get('poolFactory') as string, ownerAcc) as unknown as PoolFactory
    const compoundOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as unknown as CompoundMultiOracle
    const chainlinkOracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc) as unknown as ChainlinkMultiOracle
    const compositeOracle = await ethers.getContractAt('CompositeMultiOracle', protocol.get('compositeOracle') as string, ownerAcc) as unknown as CompositeMultiOracle
    const cTokenOracle = await ethers.getContractAt('CTokenMultiOracle', protocol.get('cTokenOracle') as string, ownerAcc) as unknown as CTokenMultiOracle
    const cloak = await ethers.getContractAt('EmergencyBrake', protocol.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake

    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

    // First give ROOT access to all contracts to the timelock, so that the timelock can manage access control for them.
    const ROOT = await cauldron.ROOT()
    await cauldron.grantRole(await cauldron.ROOT(), timelock.address); console.log(`cauldron.grantRoles(ROOT, timelock)`)
    await ladle.grantRole(ROOT, timelock.address); console.log(`ladle.grantRoles(ROOT, timelock)`)
    await witch.grantRole(ROOT, timelock.address); console.log(`witch.grantRoles(ROOT, timelock)`)
    await wand.grantRole(ROOT, timelock.address); console.log(`wand.grantRoles(ROOT, timelock)`)
    await joinFactory.grantRole(ROOT, timelock.address); console.log(`joinFactory.grantRoles(ROOT, timelock)`)
    await poolFactory.grantRole(ROOT, timelock.address); console.log(`poolFactory.grantRoles(ROOT, timelock)`)
    await fyTokenFactory.grantRole(ROOT, timelock.address); console.log(`fyTokenFactory.grantRoles(ROOT, timelock)`)
    await compoundOracle.grantRole(ROOT, timelock.address); console.log(`compoundOracle.grantRoles(ROOT, timelock)`)
    await chainlinkOracle.grantRole(ROOT, timelock.address); console.log(`chainlinkOracle.grantRoles(ROOT, timelock)`)
    await compositeOracle.grantRole(ROOT, timelock.address); console.log(`compositeOracle.grantRoles(ROOT, timelock)`)
    await cTokenOracle.grantRole(ROOT, timelock.address); console.log(`cTokenOracle.grantRoles(ROOT, timelock)`)
    await cloak.grantRole(ROOT, timelock.address); console.log(`cloak.grantRoles(ROOT, timelock)`)

    // TODO: Execute a proposal to remove ROOT from the deployer

    // Then give access to each of the governance functions to the timelock, through a proposal to bundle them
    const proposal : Array<{ target: string; data: string}> = []
  
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
            timelock.address
        ])
    })
    console.log(`cauldron.grantRoles(gov, timelock)`)
  
    proposal.push({
        target: ladle.address,
        data: ladle.interface.encodeFunctionData('grantRoles', [
            [
                id(ladle.interface, 'addJoin(bytes6,address)'),
                id(ladle.interface, 'addPool(bytes6,address)'),
                id(ladle.interface, 'addToken(address,bool)'),
                id(ladle.interface, 'addIntegration(address,bool)'),
                id(ladle.interface, 'addModule(address,bool)'),
                id(ladle.interface, 'setFee(uint256)'),
            ],
            timelock.address
        ])
    })
    console.log(`ladle.grantRoles(gov, timelock)`)

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
        target: poolFactory.address,
        data: poolFactory.interface.encodeFunctionData('grantRoles', [
            [
                id(poolFactory.interface, 'setParameter(bytes32,int128)'),
            ],
            timelock.address
        ])
    })
    console.log(`poolFactory.grantRoles(gov, timelock)`)

    proposal.push({
        target: compoundOracle.address,
        data: compoundOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(compoundOracle.interface, 'setSource(bytes6,bytes6,address)'),
                id(compoundOracle.interface, 'setSources(bytes6[],bytes6[],address[])'),
            ],
            timelock.address
        ])
    })
    console.log(`compoundOracle.grantRoles(gov, timelock)`)

    proposal.push({
        target: chainlinkOracle.address,
        data: chainlinkOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(chainlinkOracle.interface, 'setSource(bytes6,bytes6,address)'),
                id(chainlinkOracle.interface, 'setSources(bytes6[],bytes6[],address[])'),
            ],
            timelock.address
        ])
    })
    console.log(`chainlinkOracle.grantRoles(gov, timelock)`)

    proposal.push({
        target: cTokenOracle.address,
        data: cTokenOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(cTokenOracle.interface, 'setSource(bytes6,bytes6,address)'),
                id(cTokenOracle.interface, 'setSources(bytes6[],bytes6[],address[])'),
            ],
            timelock.address
        ])
    })
    console.log(`cTokenOracle.grantRoles(gov, timelock)`)

    proposal.push({
        target: compositeOracle.address,
        data: compositeOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(compositeOracle.interface, 'setSource(bytes6,bytes6,address)'),
                id(compositeOracle.interface, 'setSources(bytes6[],bytes6[],address[])'),
                id(compositeOracle.interface, 'setPath(bytes6,bytes6,bytes6[])'),
                id(compositeOracle.interface, 'setPaths(bytes6[],bytes6[],bytes6[][])'),
            ],
            timelock.address
        ])
    })
    console.log(`compositeOracle.grantRoles(gov, timelock)`)

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)

    console.timeEnd("Governance set in")
})()