import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, mapToJson } from '../shared/helpers'
import { seriesData } from './config'

import { Series } from '../fixtures/series'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'


const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;

 /**
 * This script deploys the yield v2 protocol series specified in config.ts
 * 
 * run:
 * npx hardhat run ./environments/series.ts --network localhost
 *
 */

console.time("Series added in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    
    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const safeERC20Namer = await ethers.getContractAt('SafeERC20Namer', protocol.get('safeERC20Namer') as string, ownerAcc) as unknown as SafeERC20Namer

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
})()