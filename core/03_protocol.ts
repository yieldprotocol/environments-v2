import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { ETH } from '../shared/constants'

import { Protocol } from './protocol'
import { mapToJson, jsonToMap } from '../shared/helpers'

/**
 * This script deploys a minimal instance of the yield v2 protocol, with no oracle sources, assets, joins, series or pools
 * 
 * run:
 * npx hardhat run ./environments/protocol.ts --network localhost
 *
 */

const json = fs.readFileSync('./output/assets.json', 'utf8')
const assets = jsonToMap(json) as Map<string, string>;

const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
const planner = governance.get('planner') as string;
const executor = governance.get('executor') as string;

console.time("Protocol deployed in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const wethAddress = assets.get(ETH) as string
    const protocol = await Protocol.setup(ownerAcc, planner, executor, wethAddress)
        
    fs.writeFileSync('./output/protocol.json', mapToJson(protocol.asMap()), 'utf8')
    console.timeEnd("Protocol deployed in")

    // SafeERC20Namer is a library that is only used in constructors, and needs a special format for etherscan verification
    fs.writeFileSync('./safeERC20Namer.js', `module.exports = { SafeERC20Namer: "${ protocol.safeERC20Namer.address }" }`, 'utf8')

    /* test file output reading */
    // const _jsonFromFile =  fs.readFileSync('./output/protocol.json', 'utf8');
    // const _protocol = JSON.parse(_jsonFromFile);
    // console.log(_protocol)

})()