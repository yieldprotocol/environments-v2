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
import { AccessControl } from '../typechain/AccessControl'

/**
 * This script gives governance rights to the governor over the whole Yield v2 Protocol
 * 
 * run:
 * npx hardhat run ./environments/governance.ts --network localhost
 *
 */

const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;

console.time("Orchestration set in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
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

    await cauldron.grantRoles(
        [
          id('build(address,bytes12,bytes6,bytes6)'),
          id('destroy(bytes12)'),
          id('tweak(bytes12,bytes6,bytes6)'),
          id('give(bytes12,address)'),
          id('pour(bytes12,int128,int128)'),
          id('stir(bytes12,bytes12,uint128,uint128)'),
          id('roll(bytes12,bytes6,int128)'),
        ],
        ladle.address
    ); console.log(`cauldron.grantRoles(ladle)`)

    await cauldron.grantRoles(
        [
            id('give(bytes12,address)'),
            id('grab(bytes12,address)'),
            id('slurp(bytes12,uint128,uint128)')
        ],
        witch.address
    ); console.log(`cauldron.grantRoles(witch)`)

    await cauldron.grantRoles(
        [
            id('addAsset(bytes6,address)'),
            id('addSeries(bytes6,bytes6,address)'),
            id('addIlks(bytes6,bytes6[])'),
            id('setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
            id('setRateOracle(bytes6,address)'),
            id('setSpotOracle(bytes6,bytes6,address,uint32)'),
        ],
        wand.address
    ); console.log(`cauldron.grantRoles(wand)`)

    await ladle.grantRoles(
        [
            id('addJoin(bytes6,address)'),
            id('addPool(bytes6,address)'),
        ],
        wand.address
    ); console.log(`ladle.grantRoles(wand)`)

    await witch.grantRoles(
      [
        id('setIlk(bytes6,uint32,uint64,uint128)')
      ],
      wand.address
    ); console.log(`witch.grantRoles(wand)`)

    await joinFactory.grantRoles(
        [
            id('createJoin(address)')
        ],
        wand.address
    ); console.log(`joinFactory.grantRoles(wand)`)
    
    await fyTokenFactory.grantRoles(
        [
            id('createFYToken(bytes6,address,address,uint32,string,string)')
        ],
        wand.address
    ); console.log(`fyTokenFactory.grantRoles(wand)`)

    await poolFactory.grantRoles(
        [
            id('createPool(address,address)'),
        ],
        wand.address
    ); console.log(`poolFactory.grantRoles(wand`)
    
    await compoundOracle.grantRole(id('setSource(bytes6,bytes6,address)'), wand.address); console.log(`compoundOracle.grantRoles(wand)`)
    await chainlinkOracle.grantRole(id('setSource(bytes6,bytes6,address)'), wand.address); console.log(`chainlinkOracle.grantRoles(wand)`)
    await compositeOracle.grantRole(id('setSource(bytes6,bytes6,address)'), wand.address); console.log(`compositeOracle.grantRoles(wand)`)
    await cTokenOracle.grantRole(id('setSource(bytes6,bytes6,address)'), wand.address); console.log(`cTokenOracle.grantRoles(wand)`)

    await cauldron.grantRole('0x00000000', cloak.address); console.log(`cauldron.grantRoles(cloak)`)
    await ladle.grantRole('0x00000000', cloak.address); console.log(`ladle.grantRoles(cloak)`)
    await witch.grantRole('0x00000000', cloak.address); console.log(`witch.grantRoles(cloak)`)
    await joinFactory.grantRole('0x00000000', cloak.address); console.log(`joinFactory.grantRoles(cloak)`)
    await fyTokenFactory.grantRole('0x00000000', cloak.address); console.log(`fyTokenFactory.grantRoles(cloak)`)
    await compoundOracle.grantRole('0x00000000', cloak.address); console.log(`compoundOracle.grantRoles(cloak)`)
    await chainlinkOracle.grantRole('0x00000000', cloak.address); console.log(`chainlinkOracle.grantRoles(cloak)`)
    await compositeOracle.grantRole('0x00000000', cloak.address); console.log(`compositeOracle.grantRoles(cloak)`)
    await cTokenOracle.grantRole('0x00000000', cloak.address); console.log(`cTokenOracle.grantRoles(cloak)`)

    await cloak.plan(ladle.address, [cauldron.address], [[
        id('build(address,bytes12,bytes6,bytes6)'),
        id('destroy(bytes12)'),
        id('tweak(bytes12,bytes6,bytes6)'),
        id('give(bytes12,address)'),
        id('pour(bytes12,int128,int128)'),
        id('stir(bytes12,bytes12,uint128,uint128)'),
        id('roll(bytes12,bytes6,int128)'),
    ]]); console.log(`cloak.plan(ladle)`)

    await cloak.plan(witch.address, [cauldron.address], [[
        id('give(bytes12,address)'),
        id('grab(bytes12,address)'),
        id('slurp(bytes12,uint128,uint128)')
    ]]); console.log(`cloak.plan(witch)`)

    await cloak.plan(wand.address,
        [
            cauldron.address,
            ladle.address,
            witch.address,
            joinFactory.address,
            fyTokenFactory.address,
            poolFactory.address,
            compoundOracle.address,
            chainlinkOracle.address,
            compositeOracle.address,
            cTokenOracle.address,
        ], [
        [
            id('addAsset(bytes6,address)'),
            id('addSeries(bytes6,bytes6,address)'),
            id('addIlks(bytes6,bytes6[])'),
            id('setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
            id('setRateOracle(bytes6,address)'),
            id('setSpotOracle(bytes6,bytes6,address,uint32)'),
        ],
        [
            id('addJoin(bytes6,address)'),
            id('addPool(bytes6,address)'),
            id('setModule(address,bool)'),
            id('setFee(uint256)'),
        ],
        [
            id('setIlk(bytes6,uint32,uint64,uint128)'),
        ],
        [
            id('createJoin(address)'),
        ],
        [
            id('createFYToken(bytes6,address,address,uint32,string,string)'),
        ],
        [
            id('createPool(address,address)'),
        ],
        [
            id('setSource(bytes6,bytes6,address)'),
        ],
        [ 
            id('setSource(bytes6,bytes6,address)'),
        ],
        [ 
            id('setSource(bytes6,bytes6,address)'),
        ],
        [ 
            id('setSource(bytes6,bytes6,address)'),
        ]
    ]); console.log(`cloak.plan(wand)`)


    console.timeEnd("Orchestration set in")
})()