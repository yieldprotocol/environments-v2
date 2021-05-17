import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'
import { Wand } from '../typechain/Wand'

/**
 * This script gives governance rights to the governor over the whole Yield v2 Protocol
 * 
 * run:
 * npx hardhat run ./environments/governance.ts --network localhost
 *
 */

const cauldronAddress = '0xDa22cf5b3E21B55C1FCF4a7c3e2437d319Dd65e3'
const ladleAddress = '0x2F4163FA3cb73AD2Be4C63191f34ecE2794b3c4f'
const witchAddress = '0x557eFC5F41B1d565D9bB580948e0e0d5DA754095'
const wandAddress = '0x74469D604633425b1708C0D557d94A40eEAe201f'
let governor = '0x1Bd3Abb6ef058408734EA01cA81D325039cd7bcA' // Bruce

console.time("Governance set in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const cauldron = await ethers.getContractAt('Cauldron', cauldronAddress, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', ladleAddress, ownerAcc) as unknown as Ladle
    const witch = await ethers.getContractAt('Witch', witchAddress, ownerAcc) as unknown as Witch
    const wand = await ethers.getContractAt('Wand', wandAddress, ownerAcc) as unknown as Wand
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

    await wand.grantRoles(
        [
          id('addAsset(bytes6,address)'),
          id('makeBase(bytes6,address,address,address)'),
          id('makeIlk(bytes6,bytes6,address,address,uint32,uint128)'),
          id('addSeries(bytes6,bytes6,uint32,bytes6[],string,string)'),
          id('addPool(bytes6,bytes6)'),
        ],
        governor
      )
      console.timeEnd("Governance set in")
})()