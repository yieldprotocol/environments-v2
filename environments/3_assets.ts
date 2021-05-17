import { ethers, waffle } from 'hardhat'
import { ETH, DAI, USDC } from '../shared/constants'
import { Assets } from '../fixtures/assets'

import { IOracle } from '../typechain/IOracle'
import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'

/**
 * 
 * README
 * 
 * 
 */
const TST = ethers.utils.formatBytes32String('TST').slice(0, 14)
const cauldronAddress = '0xeF7a4151c5899226C8C16AF98Fe43f756B449394'
const ladleAddress = '0x109919afEF2c7d76d07093810a19adC9D99A876C'

const assets: Array<[string, string]> =  [ 
    [DAI, '0xE0C3aBB1f67862810a6A1342Fc78d3666C807b6C'],
    [USDC,'0xbC9047227F41D84d333515ffA6Ea365C5d246Bd8'],
    [ETH, '0xbafe9ae56ea921f63CE949B738dE2e1Bc0DF19a6'],
    [TST, '0x6e7666d711092Cc6F3C77DCA5BA74cBEB4D49663'],
]
const baseIds: Array<string> = [DAI, USDC]

const rateOracleAddress = '0x7B942D145E0F6dE62076477F031712532d91FbF8'
const rateSourceAddresses = new Map([
    [DAI, '0x4CD8019090188Aa8aF26e14B87AF8bb10ef5C22B'],
    [USDC, '0xb91aCD6211F9aD6652827e8e21804e4D94BBC7c8'],
])
const spotOracleAddress = '0x028125f4f55d87132688857504BFcFC70de374Bd'
const spotSourceAddresses = new Map([
    [DAI, new Map([
        [USDC, '0x3E1C6A0033Beb66cfB58aC9fB88b433a1CaD071B'],
        [ETH, '0xC28c988548c039869073058ADDE32D330bd1385c'],
        [TST, '0x8E480b1bE1967F3178da9Bb272117160272C9a2e'],
    ])],
    [USDC, new Map([
        [DAI, '0xBF8A5E909D4E5a946B2F303B06944ba4c49ad3Ae'],
        [ETH, '0xDeA94B5d273A557a3980D12a70f7fc1536237298'],
        [TST, '0xDeA94B5d273A557a3980D12a70f7fc1536237298'],
    ])],
])

 /**
 * 
 * run:
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

console.time("Assets added in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    
    const cauldron = await ethers.getContractAt('Cauldron', cauldronAddress, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', ladleAddress, ownerAcc) as unknown as Ladle
    const rateOracle = await ethers.getContractAt('CompoundMultiOracle', rateOracleAddress, ownerAcc) as IOracle
    const spotOracle = await ethers.getContractAt('ChainlinkMultiOracle', spotOracleAddress, ownerAcc) as IOracle

    await Assets.setup(
        ownerAcc,
        cauldron,
        ladle,
        assets,                 // [ [assetId, assetAddress], ... ]
        baseIds,
        rateOracle,
        rateSourceAddresses,    // baseId => sourceAddress
        spotOracle,
        spotSourceAddresses     // baseId,quoteId => sourceAddress
    )
    console.timeEnd("Assets added in")
})()