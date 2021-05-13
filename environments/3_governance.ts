import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'

/**
 * This script gives governance rights to the governor over the whole Yield v2 Protocol
 * 
 * run:
 * npx hardhat run ./environments/governance.ts --network localhost
 *
 */

const cauldronAddress = '0xe70f935c32dA4dB13e7876795f1e175465e6458e'
const ladleAddress = '0x3C15538ED063e688c8DF3d571Cb7a0062d2fB18D'
const witchAddress = '0xccf1769D8713099172642EB55DDFFC0c5A444FE9'
let governor = ''

console.time("Assets deployed in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const cauldron = await ethers.getContractAt('Cauldron', cauldronAddress, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', ladleAddress, ownerAcc) as unknown as Ladle
    const witch = await ethers.getContractAt('Witch', witchAddress, ownerAcc) as unknown as Witch
    governor = await ownerAcc.getAddress()

    await cauldron.grantRoles(
        [
        id('setAuctionInterval(uint32)'),
        id('addAsset(bytes6,address)'),
        id('addSeries(bytes6,bytes6,address)'),
        id('addIlks(bytes6,bytes6[])'),
        id('setMaxDebt(bytes6,bytes6,uint128)'),
        id('setRateOracle(bytes6,address)'),
        id('setSpotOracle(bytes6,bytes6,address,uint32)'),
        ],
        governor
    ); console.log(`cauldron.grantRoles(gov, ${governor})`)

    await ladle.grantRoles(
        [
        id('addJoin(bytes6,address)'),
        id('addPool(bytes6,address)'),
        id('setPoolRouter(address)'),
        id('setFee(uint256)'),
        ],
        governor
    ); console.log(`ladle.grantRoles(gov, ${governor})`)

    await witch.grantRoles(
        [
        id('setAuctionTime(uint128)'),
        id('setInitialProportion(uint128)'),
        ],
        governor
    ); console.log(`witch.grantRoles(gov, ${governor})`)
})()