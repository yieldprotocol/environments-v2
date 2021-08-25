import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, mapToJson } from '../shared/helpers'
import { strategiesData, strategiesInit } from './config'
import { setup as setupStrategies, init as initStrategies } from '../fixtures/strategies'
import { Ladle } from '../typechain/Ladle'
import { Timelock } from '../typechain/Timelock'


const pools = jsonToMap(fs.readFileSync('./output/pools.json', 'utf8')) as Map<string,string>;
const strategies = jsonToMap(fs.readFileSync('./output/strategies.json', 'utf8')) as Map<string,string>;
const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;

 /**
 * This script deploys the yield v2 protocol series specified in config.ts
 * 
 * run:
 * npx hardhat run ./environments/series.ts --network localhost
 *
 */

console.time("Strategies added in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock

    await initStrategies(ownerAcc, timelock, pools, strategies, strategiesInit)
    console.timeEnd("Strategies added in")
})()