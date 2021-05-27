import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, mapToJson } from '../shared/helpers'
import { Mocks } from '../fixtures/mocks'
import { assetIds, baseIds, ilkIds } from './config'

/**
 * This script integrates existing assets with the yield v2 protocol, deploying Joins in the process
 * 
 * run:
 * npx hardhat run ./environments/assets.ts --network localhost
 *
 */
 
console.time("Mocks deployed in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    
    const mocks = await Mocks.setup(ownerAcc, assetIds, baseIds, ilkIds)

    /* keeping it flat and simple for now, albeit a bit 'unDRY' */
    let json = fs.readFileSync('./output/assets.json', 'utf8')
    const assets = jsonToMap(json) as Mocks["assets"]
    fs.writeFileSync('./output/assets.json', mapToJson(new Map([...assets, ...mocks.assets])), 'utf8')
    
    // fs.writeFileSync('./output/chiSources.json', mapToJson(mocks.chiSources), 'utf8')
    // fs.writeFileSync('./output/rateSources.json', mapToJson(mocks.rateSources), 'utf8')

    json = fs.readFileSync('./output/spotSources.json', 'utf8')
    const spotSources = jsonToMap(json) as Mocks["spotSources"]
    fs.writeFileSync('./output/spotSources.json', mapToJson(new Map([...spotSources, ...mocks.spotSources])), 'utf8')
    
    console.timeEnd("Mocks deployed in")

})()