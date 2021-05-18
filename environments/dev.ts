import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'

import { ETH } from '../shared/constants'
import { assetIds, baseIds, ilkIds, seriesData, testAddrsToFund } from './config'

import { Mocks } from '../fixtures/mocks'
import { Protocol } from '../fixtures/protocol'
import { Assets } from '../fixtures/assets'
import { Series } from '../fixtures/series'

import { WETH9Mock } from '../typechain/WETH9Mock'
import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'
import { Wand } from '../typechain/Wand'
import { IOracle } from '../typechain/IOracle'
import { fundExternalAccounts } from '../shared/helpers'



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
}

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();   
    const owner = await ownerAcc.getAddress()

    console.time("Mocks deployed in")
    const mocks = await Mocks.setup(ownerAcc, assetIds, baseIds, ilkIds)
    const weth = mocks.assets.get(ETH) as WETH9Mock
    console.timeEnd("Mocks deployed in")

    console.time("Protocol deployed in")
    const protocol = await Protocol.setup(ownerAcc, weth.address)
    const cauldron = protocol.cauldron as Cauldron
    const ladle = protocol.ladle.ladle as Ladle
    const witch = protocol.witch as Witch
    const wand = protocol.wand as Wand
    const rateChiOracle = protocol.compoundOracle as unknown as IOracle
    const spotOracle = protocol.chainlinkOracle as unknown as IOracle
    console.timeEnd("Protocol deployed in")

    console.time("Governance set in");
    await governance(cauldron, ladle, witch, wand, owner)
    console.timeEnd("Governance set in")

    console.time("Assets added in");


    const assets =  await Assets.setup(
        ownerAcc,
        ladle,
        wand,
        mocks.assets,           // Map<assetId, ERC20Mock | WETH9Mock>
        baseIds,
        ilkIds,
        rateChiOracle,
        mocks.rateSources,    // baseId => sourceAddress
        mocks.chiSources,    // baseId => sourceAddress
        spotOracle,
        mocks.spotSources     // baseId,quoteId => sourceAddress
    )
    console.timeEnd("Assets added in")

    console.time("Series added in");
    const series = await Series.setup(
        ownerAcc,
        cauldron,
        ladle,
        wand,
        seriesData,
    )

    console.timeEnd("Series added in")

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