import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap } from '../shared/helpers'
import { compositePairs, compositePaths } from './config'

import { setupRateChi, setupSpot, setupComposite } from '../fixtures/oracles'

import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { CompositeMultiOracle } from '../typechain/CompositeMultiOracle'
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'

/* Read in deployment data if available */
const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
const rateSources = jsonToMap(fs.readFileSync('./output/rateSources.json', 'utf8')) as Map<string, string>;
const chiSources = jsonToMap(fs.readFileSync('./output/chiSources.json', 'utf8')) as Map<string, string>;
const spotSources = jsonToMap(fs.readFileSync('./output/spotSources.json', 'utf8')) as Map<string, string>;

console.time("Oracles set in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();   
    const compoundOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as CompoundMultiOracle
    const spotOracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc) as ChainlinkMultiOracle
    const compositeOracle = await ethers.getContractAt('CompositeMultiOracle', protocol.get('compositeOracle') as string, ownerAcc) as CompositeMultiOracle

    await setupRateChi(
        compoundOracle,
        rateSources,
        chiSources
    )

    await setupSpot(
        spotOracle,
        spotSources
    )

    await setupComposite(
        compositeOracle,
        spotOracle,
        compositePairs,
        compositePaths
    )

    console.timeEnd("Oracles set in")
})()