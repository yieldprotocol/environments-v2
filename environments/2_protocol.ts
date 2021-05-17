import { ethers } from 'hardhat'
import { Protocol } from '../fixtures/protocol'

/**
 * This script deploys a minimal instance of the yield v2 protocol, with no oracle sources, assets, joins, series or pools
 * 
 * run:
 * npx hardhat run ./environments/protocol.ts --network localhost
 *
 */

const WETH9 = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

console.time("Protocol deployed in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    await Protocol.setup(ownerAcc, WETH9)
    console.timeEnd("Protocol deployed in")
})()