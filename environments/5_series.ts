import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, mapToJson } from '../shared/helpers'
import { seriesData } from './config'

import { Protocol } from '../fixtures/protocol'
import { Series } from '../fixtures/series'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'

/**
 * 
 * README
 * 
 * 
 */
const protocol = JSON.parse(fs.readFileSync('protocol.json', 'utf8'), jsonToMap) as Protocol;

 /**
 * 
 * run:
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

console.time("Series added in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    
    const cauldron = await ethers.getContractAt('Cauldron', protocol.cauldron.address, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.ladle.address, ownerAcc) as unknown as Ladle
    const wand = await ethers.getContractAt('Wand', protocol.wand.address, ownerAcc) as unknown as Wand

    const series = await Series.setup(
        ownerAcc,
        cauldron,
        ladle,
        wand,
        seriesData,
    )
    console.timeEnd("Series added in")

    fs.writeFileSync('series.json', JSON.stringify(series, mapToJson), 'utf8')
})()