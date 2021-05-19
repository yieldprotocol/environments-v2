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

    fs.writeFileSync('mocks.json', mapToJson(mocks.assets), 'utf8')
    
    console.timeEnd("Mocks deployed in")

    /* test reading */
    const readMockMap =  fs.readFileSync('mocks.json', 'utf8');
    const mockAssetMapHydrated = jsonToMap(readMockMap);

    // console.log( mockAssetMapHydrated )

})()