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
import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { CompositeMultiOracle } from '../typechain/CompositeMultiOracle'
import { TimeLock } from '../typechain/TimeLock'

/**
 * This script gives governance rights to the governor over the whole Yield v2 Protocol
 * 
 * run:
 * npx hardhat run ./environments/governance.ts --network localhost
 *
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
    const compoundOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as unknown as CompoundMultiOracle
    const chainlinkOracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc) as unknown as ChainlinkMultiOracle
    const compositeOracle = await ethers.getContractAt('CompositeMultiOracle', protocol.get('compositeOracle') as string, ownerAcc) as unknown as CompositeMultiOracle
    const timelock = await ethers.getContractAt('TimeLock', governance.get('timelock') as string, ownerAcc) as unknown as TimeLock

    await cauldron.grantRoles(
        [
            id('addAsset(bytes6,address)'),
            id('addSeries(bytes6,bytes6,address)'),
            id('addIlks(bytes6,bytes6[])'),
            id('setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
            id('setRateOracle(bytes6,address)'),
            id('setSpotOracle(bytes6,bytes6,address,uint32)'),
        ],
        timelock.address
    ); console.log(`cauldron.grantRoles(timelock, ${timelock.address})`)

    await ladle.grantRoles(
        [
            id('addJoin(bytes6,address)'),
            id('addPool(bytes6,address)'),
            id('setModule(address,bool)'),
            id('setFee(uint256)'),
        ],
        timelock.address
    ); console.log(`ladle.grantRoles(timelock, ${timelock.address})`)

    await witch.grantRoles(
        [
            id('setIlk(bytes6,uint32,uint64,uint128)'),
        ],
        timelock.address
    ); console.log(`witch.grantRoles(timelock, ${timelock.address})`)

    await wand.grantRoles(
        [
            id('addAsset(bytes6,address)'),
            id('makeBase(bytes6,address,address,address)'),
            id('makeIlk(bytes6,bytes6,address,address,uint32,uint96,uint24,uint8)'),
            id('addSeries(bytes6,bytes6,uint32,bytes6[],string,string)'),
            id('addPool(bytes6,bytes6)'),
            id('point(bytes32,address)'),
        ],
        timelock.address
    ); console.log(`wand.grantRoles(timelock, ${timelock.address})`)

    await joinFactory.grantRoles([id('createJoin(address)')], timelock.address)
    console.log(`joinFactory.grantRoles(timelock, ${timelock.address})`)

    await fyTokenFactory.grantRoles([id('createFYToken(bytes6,address,address,uint32,string,string)')], timelock.address)
    console.log(`fyTokenFactory.grantRoles(timelock, ${timelock.address})`)

    await compoundOracle.grantRoles([
        id('setSource(bytes6,bytes6,address)'),
        id('setSources(bytes6[],bytes6[],address)'),
    ], timelock.address); console.log(`compoundOracle.grantRoles(timelock)`)

    await chainlinkOracle.grantRoles([
        id('setSource(bytes6,bytes6,address)'),
        id('setSources(bytes6[],bytes6[],address)'),
    ], timelock.address); console.log(`chainlinkOracle.grantRoles(timelock)`)

    await compositeOracle.grantRoles([
        id('setSource(bytes6,bytes6,address)'),
        id('setSources(bytes6[],bytes6[],address)'),
    ], timelock.address); console.log(`compositeOracle.grantRoles(timelock)`)

    console.timeEnd("Governance set in")
})()