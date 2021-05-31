import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, mapToJson } from '../shared/helpers'
import { baseIds, ilkIds } from './config'

import { Assets } from '../fixtures/assets'

import { IOracle } from '../typechain/IOracle'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'

/* Read in deployment data if available */
const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string, string>;
const chiSources = jsonToMap(fs.readFileSync('./output/chiSources.json', 'utf8')) as Map<string, string>;
const rateSources = jsonToMap(fs.readFileSync('./output/rateSources.json', 'utf8')) as Map<string, string>;
const spotSources = jsonToMap(fs.readFileSync('./output/spotSources.json', 'utf8')) as Map<string, string>;

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