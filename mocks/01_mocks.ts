import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { mapToJson } from '../shared/helpers'
import { Mocks } from './mocks'
import { assetIds, baseIds, spotPairs } from '../core/config'
import { WAD, ETH, DAI, USDC, WBTC, USDT } from '../shared/constants'

/**
 * @dev Deploy mock tokens and oracle sources for testing
 */
 
(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    console.log(ETH)
    console.log(DAI)
    console.log(USDC)
    console.log(WBTC)
    // const mocks = await Mocks.setup(ownerAcc, assetIds, baseIds, spotPairs)

    /* keeping it flat and simple for now, albeit a bit 'unDRY' */
    /* fs.writeFileSync('./addresses/assets.json', mapToJson(mocks.assets), 'utf8')
    fs.writeFileSync('./addresses/chiSources.json', mapToJson(mocks.chiSources), 'utf8')
    fs.writeFileSync('./addresses/rateSources.json', mapToJson(mocks.rateSources), 'utf8')
    fs.writeFileSync('./addresses/spotSources.json', mapToJson(mocks.spotSources), 'utf8') */
})()