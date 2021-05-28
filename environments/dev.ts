import *  as fs from 'fs'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { id } from '@yield-protocol/utils-v2'

import { WAD, ETH } from '../shared/constants'
import { assetIds, baseIds, ilkIds, seriesData, testAddrsToFund, initializePools } from './config'


import { Mocks } from '../fixtures/mocks'
import { Protocol } from '../fixtures/protocol'
import { Assets } from '../fixtures/assets'
import { Series } from '../fixtures/series'

import { WETH9Mock } from '../typechain/WETH9Mock'
import { ERC20Mock } from '../typechain/ERC20Mock'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'
import { Wand } from '../typechain/Wand'
import { FYToken } from '../typechain/FYToken'
import { Pool } from '../typechain/Pool'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'
import { IOracle } from '../typechain/IOracle'
import { fundExternalAccounts, flattenContractMap, mapToJson } from '../shared/helpers'


/**
 * This script integrates existing assets with the yield v2 protocol, deploying Joins in the process
 * 
 * run:
 * npx hardhat run ./environments/assets.ts --network localhost
 *
 */

async function governance(cauldron: Cauldron, ladle: Ladle, witch: Witch, wand: Wand, governor: string) {
    await cauldron.grantRoles(
        [
        id('setAuctionInterval(uint32)'),
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
          id('makeIlk(bytes6,bytes6,address,address,uint32,uint96,uint24,uint8)'),
          id('addSeries(bytes6,bytes6,uint32,bytes6[],string,string)'),
          id('addPool(bytes6,bytes6)'),
        ],
        governor
      ); console.log(`wand.grantRoles(gov, ${governor})`)
}

async function initialize(ownerAcc: SignerWithAddress, pool: Pool) {
    const base = (await ethers.getContractAt('ERC20Mock', await pool.base(), ownerAcc) as unknown) as ERC20Mock
    const fyToken = (await ethers.getContractAt('FYToken', await pool.fyToken(), ownerAcc) as unknown) as FYToken

    // Supply pool with a million tokens of each for initialization
    try {
    // try minting tokens (as the token owner for mock tokens)
    await base.mint(pool.address, initializePools); console.log(`base.mint(pool.address)`)
    } catch (e) { 
    // if that doesn't work, try transfering tokens from a whale/funder account
    // await transferFromFunder( base.address, pool.address, WAD.mul(1000000), funder)
    console.log(e);
    }
    // Initialize pool
    await pool.mint(await ownerAcc.getAddress(), true, 0); console.log(`pool.mint(owner)`)

    // Donate fyToken to the pool to skew it
    await fyToken.grantRole(id('mint(address,uint256)'), await ownerAcc.getAddress()); console.log(`fyToken.grantRoles(owner)`)

    await fyToken.mint(pool.address, initializePools.div(9)); console.log(`fyToken.mint(pool.address)`)
    await pool.sync(); console.log(`pool.sync`)  
}


(async () => {
    const [ ownerAcc ] = await ethers.getSigners();   
    const owner = await ownerAcc.getAddress()

    console.time("Mocks deployed in")
    const mocks = await Mocks.setup(ownerAcc, assetIds, baseIds, ilkIds)
    const weth = mocks.assets.get(ETH) as WETH9Mock
    console.timeEnd("Mocks deployed in")

    fs.writeFileSync('./output/assets.json', mapToJson(mocks.assets), 'utf8')
    fs.writeFileSync('./output/chiSources.json', mapToJson(mocks.chiSources), 'utf8')
    fs.writeFileSync('./output/rateSources.json', mapToJson(mocks.rateSources), 'utf8')
    fs.writeFileSync('./output/spotSources.json', mapToJson(mocks.spotSources), 'utf8')

    console.time("Protocol deployed in")
    const protocol = await Protocol.setup(ownerAcc, weth.address)
    const cauldron = protocol.cauldron as Cauldron
    const ladle = protocol.ladle as Ladle
    const witch = protocol.witch as Witch
    const wand = protocol.wand as Wand
    const safeERC20Namer = protocol.safeERC20Namer as SafeERC20Namer
    const rateChiOracle = protocol.compoundOracle as unknown as IOracle
    const spotOracle = protocol.chainlinkOracle as unknown as IOracle
    console.timeEnd("Protocol deployed in")

    fs.writeFileSync('./output/protocol.json', mapToJson(protocol.asMap()), 'utf8')

    console.time("Governance set in");
    await governance(cauldron, ladle, witch, wand, owner)
    console.timeEnd("Governance set in")

    console.time("Assets added in");

    const assets =  await Assets.setup(
        ownerAcc,
        ladle,
        wand,
        flattenContractMap(mocks.assets),           // Map<assetId, ERC20Mock | WETH9Mock>
        baseIds,
        ilkIds,
        rateChiOracle,
        flattenContractMap(mocks.rateSources),    // baseId => sourceAddress
        flattenContractMap(mocks.chiSources),    // baseId => sourceAddress
        spotOracle,
        flattenContractMap(mocks.spotSources)     // baseId,quoteId => sourceAddress
    )
    console.timeEnd("Assets added in")

    fs.writeFileSync('./output/joins.json', mapToJson(assets.joins), 'utf8')

    console.time("Series added in");
    const series = await Series.setup(
        ownerAcc,
        cauldron,
        ladle,
        wand,
        safeERC20Namer,
        seriesData,
    )
    console.timeEnd("Series added in")

    fs.writeFileSync('./output/fyTokens.json', mapToJson(series.fyTokens), 'utf8')
    fs.writeFileSync('./output/pools.json', mapToJson(series.pools), 'utf8')

    if (initializePools.toString() !== '0') {
        console.time("Pools initialized");
        series.pools.forEach(async (pool: Pool)=> {initialize(ownerAcc, pool)})
        console.timeEnd("Pools initialized")
    }

    console.log('\n')
    console.log(`### PROTOCOL DEPLOYMENTS ###`)
    console.log('\n')

    console.log(`"Cauldron": "${protocol.cauldron.address}",`)
    console.log(`"Ladle" : "${protocol.ladle.address}",`)
    console.log(`"PoolRouter" : "${protocol.poolRouter.address}",`)
    console.log(`"Witch" : "${protocol.witch.address}",`)
    console.log(`"Wand" : "${protocol.wand.address}",`)
    console.log(`"CompoundOracle" : "${protocol.compoundOracle.address}",`)
    console.log(`"ChainlinkOracle" : "${protocol.chainlinkOracle.address}"`)

    console.log('\n')
    console.log(`### `)
    console.log('\n')

    try { 
        fundExternalAccounts(mocks.assets, testAddrsToFund)
    } catch {
        console.log('Error auto funding test accounts')
    }

})()