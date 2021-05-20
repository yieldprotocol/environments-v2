import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { ETH } from '../shared/constants'
import { Mocks } from '../fixtures/mocks'
import { Protocol } from '../fixtures/protocol'
import { mapToJson, jsonToMap } from '../shared/helpers'

import { WETH9Mock } from '../typechain/WETH9Mock'

/**
 * This script deploys a minimal instance of the yield v2 protocol, with no oracle sources, assets, joins, series or pools
 * 
 * run:
 * npx hardhat run ./environments/protocol.ts --network localhost
 *
 */

const json = fs.readFileSync('./output/assets.json', 'utf8')
const assets = jsonToMap(json) as Mocks["assets"];

console.time("Protocol deployed in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const weth = assets.get(ETH) as WETH9Mock
    const protocol = await Protocol.setup(ownerAcc, weth.address)
        
    fs.writeFileSync('./output/protocol.json', JSON.stringify(protocol), 'utf8')
    console.timeEnd("Protocol deployed in")

    /* test file output reading */
    // const _jsonFromFile =  fs.readFileSync('./output/protocol.json', 'utf8');
    // const _protocol = JSON.parse(_jsonFromFile);
    // console.log(_protocol)

})()