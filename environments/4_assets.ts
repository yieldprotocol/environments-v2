import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, mapToJson } from '../shared/helpers'
import { baseIds, ilkIds, TST } from './config'
import { ETH, DAI, USDC, WBTC } from '../shared/constants'

import { Assets } from '../fixtures/assets'
import { Mocks } from '../fixtures/mocks'

import { IOracle } from '../typechain/IOracle'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'

/* Read in deployment data if available */
const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
const allAssets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Mocks["assets"];
const assets = new Map(); assets.set(WBTC, allAssets.get(WBTC));
const chiSources = jsonToMap(fs.readFileSync('./output/chiSources.json', 'utf8')) as Map<string, string>;
const rateSources = jsonToMap(fs.readFileSync('./output/rateSources.json', 'utf8')) as Map<string, string>;
const allSpotSources = jsonToMap(fs.readFileSync('./output/spotSources.json', 'utf8')) as Map<string, string>;
const spotSources = new Map(); spotSources.set(`${DAI},${WBTC}`, allSpotSources.get(`${DAI},${WBTC}`)); spotSources.set(`${USDC},${WBTC}`, allSpotSources.get(`${USDC},${WBTC}`))

console.time("Assets added in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();   
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const rateChiOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as IOracle
    const spotOracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc) as IOracle

    const joins = await Assets.setup(
        ownerAcc,
        ladle,
        wand,
        assets,                 // [ [assetId, assetAddress], ... ]
        baseIds,
        ilkIds,
        rateChiOracle,
        rateSources,    // baseId => sourceAddress
        chiSources,    // baseId => sourceAddress
        spotOracle,
        spotSources     // baseId,quoteId => sourceAddress
    )

    let json = fs.readFileSync('./output/joins.json', 'utf8')
    const oldJoins = jsonToMap(json) as Assets["joins"]
    fs.writeFileSync('./output/joins.json', mapToJson(new Map([...oldJoins, ...joins.joins])), 'utf8')

    console.timeEnd("Assets added in")
})()