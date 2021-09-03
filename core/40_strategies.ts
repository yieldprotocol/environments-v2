import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, mapToJson } from '../shared/helpers'
import { strategiesData } from './config'
import { setup as setupStrategies } from './strategies'
import { Ladle } from '../typechain/Ladle'
import { Timelock } from '../typechain/Timelock'


const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string,string>;
const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;

/**
 * @dev This script deploys strategies specified in config.ts
 */

console.time("Strategies added in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    
    const strategies = await setupStrategies(
        ownerAcc,
        ladle,
        timelock,
        assets,
        strategiesData,
    )
    console.timeEnd("Strategies added in")

    fs.writeFileSync('./output/strategies.json', mapToJson(strategies), 'utf8')
})()