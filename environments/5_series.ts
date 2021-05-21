import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, mapToJson } from '../shared/helpers'
import { seriesData } from './config'

import { Protocol } from '../fixtures/protocol'
import { Series } from '../fixtures/series'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'


const protocol = JSON.parse(fs.readFileSync('./output/protocol.json', 'utf8')) as Protocol;

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
    const cauldron = await ethers.getContractAt('Cauldron', protocol.cauldron.address, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.ladle.address, ownerAcc) as unknown as Ladle
    const wand = await ethers.getContractAt('Wand', protocol.wand.address, ownerAcc) as unknown as Wand
    const safeERC20Namer = await ethers.getContractAt('SafeERC20Namer', protocol.safeERC20Namer.address, ownerAcc) as unknown as SafeERC20Namer

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