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

    await cauldron.grantRole('0x00000000', timelock.address); console.log(`cauldron.grantRoles(ROOT, timelock)`)
    await ladle.grantRole('0x00000000', timelock.address); console.log(`ladle.grantRoles(ROOT, timelock)`)
    await witch.grantRole('0x00000000', timelock.address); console.log(`witch.grantRoles(ROOT, timelock)`)
    await wand.grantRole('0x00000000', timelock.address); console.log(`wand.grantRoles(ROOT, timelock)`)
    await joinFactory.grantRole('0x00000000', timelock.address); console.log(`joinFactory.grantRoles(ROOT, timelock)`)
    await poolFactory.grantRole('0x00000000', timelock.address); console.log(`poolFactory.grantRoles(ROOT, timelock)`)
    await fyTokenFactory.grantRole('0x00000000', timelock.address); console.log(`fyTokenFactory.grantRoles(ROOT, timelock)`)
    await compoundOracle.grantRole('0x00000000', timelock.address); console.log(`compoundOracle.grantRoles(ROOT, timelock)`)
    await chainlinkOracle.grantRole('0x00000000', timelock.address); console.log(`chainlinkOracle.grantRoles(ROOT, timelock)`)
    await compositeOracle.grantRole('0x00000000', timelock.address); console.log(`compositeOracle.grantRoles(ROOT, timelock)`)
    await cTokenOracle.grantRole('0x00000000', timelock.address); console.log(`cTokenOracle.grantRoles(ROOT, timelock)`)
    await cloak.grantRole('0x00000000', timelock.address); console.log(`cloack.grantRoles(ROOT, timelock)`)

    console.timeEnd("Governance set in")
})()