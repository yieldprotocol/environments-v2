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

/**
 * This script gives governance rights to the governor over the whole Yield v2 Protocol
 * 
 * run:
 * npx hardhat run ./environments/governance.ts --network localhost
 *
 */

const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
const governor = fs.readFileSync('.governor', 'utf8').trim()

console.time("Governance set in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc) as unknown as Witch
    const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const joinFactory = await ethers.getContractAt('JoinFactory', protocol.get('joinFactory') as string, ownerAcc) as unknown as JoinFactory
    const fyTokenFactory = await ethers.getContractAt('Wand', protocol.get('fyTokenFactory') as string, ownerAcc) as unknown as FYTokenFactory

    await cauldron.grantRoles(
        [
            id('addAsset(bytes6,address)'),
            id('addSeries(bytes6,bytes6,address)'),
            id('addIlks(bytes6,bytes6[])'),
            id('setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
            id('setRateOracle(bytes6,address)'),
            id('setSpotOracle(bytes6,bytes6,address,uint32)'),
        ],
        governor
    ); console.log(`cauldron.grantRoles(gov, ${governor})`)

    await ladle.grantRoles(
        [
            id('addJoin(bytes6,address)'),
            id('addPool(bytes6,address)'),
            id('setModule(address,bool)'),
            id('setFee(uint256)'),
        ],
        governor
    ); console.log(`ladle.grantRoles(gov, ${governor})`)

    await witch.grantRoles(
        [
            id('setIlk(bytes6,uint32,uint64,uint128)'),
        ],
        governor
    ); console.log(`witch.grantRoles(gov, ${governor})`)

    await wand.grantRoles(
        [
            id('addAsset(bytes6,address)'),
            id('makeBase(bytes6,address,address,address)'),
            id('makeIlk(bytes6,bytes6,address,address,uint32,uint96,uint24,uint8)'),
            id('addSeries(bytes6,bytes6,uint32,bytes6[],string,string)'),
            id('addPool(bytes6,bytes6)'),
        ],
        governor
    ); console.log(`wand.grantRoles(gov, ${governor})`)

    await joinFactory.grantRoles([id('createJoin(address)')], governor)
    console.log(`joinFactory.grantRoles(gov, ${governor})`)

    await fyTokenFactory.grantRoles([id('createFYToken(bytes6,address,address,uint32,string,string)')], governor)
    console.log(`fyTokenFactory.grantRoles(gov, ${governor})`)

    console.timeEnd("Governance set in")
})()