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

const baseIds: string[] = [DAI, USDC]
const ilkIds: string[] =  [DAI, USDC, ETH, ethers.utils.formatBytes32String('TST').slice(0, 14)]
console.time("Mocks deployed in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    
    await Mocks.setup(ownerAcc, baseIds, ilkIds)
    console.timeEnd("Mocks deployed in")
})()