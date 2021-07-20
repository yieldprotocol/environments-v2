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
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'

/**
 * This script gives governance rights to the governor over the whole Yield v2 Protocol
 * 
 * run:
 * npx hardhat run ./environments/governance.ts --network localhost
 *
 */

const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
const governor = fs.readFileSync('.governor', 'utf8').trim()

console.time("Orchestration set in");

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
    )

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
            id('setModule(address,bool)'),
            id('setFee(uint256)'),
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
    
    await compoundOracle.grantRole(id('setSource(bytes6,bytes6,address)'), wand.address); console.log(`compoundOracle.grantRoles(wand)`)
    await chainlinkOracle.grantRole(id('setSource(bytes6,bytes6,address)'), wand.address); console.log(`chainlinkOracle.grantRoles(wand)`)

    console.timeEnd("Orchestration set in")
})()