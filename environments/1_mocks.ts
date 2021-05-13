import { ethers } from 'hardhat'
import { ETH, DAI, USDC } from '../shared/constants'
import { Mocks } from '../fixtures/mocks'

/**
 * This script integrates existing assets with the yield v2 protocol, deploying Joins in the process
 * 
 * run:
 * npx hardhat run ./environments/assets.ts --network localhost
 *
 */

const assetIds: string[] =  [DAI, USDC, ETH, ethers.utils.formatBytes32String('TST').slice(0, 14)]
const baseIds: string[] = [DAI, USDC]
console.time("Mocks deployed in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    
    await Mocks.setup(ownerAcc, assetIds, baseIds)
    console.timeEnd("Mocks deployed in")
})()