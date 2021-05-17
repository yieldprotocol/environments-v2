import { ethers } from 'hardhat'
import { Protocol } from '../fixtures/protocol'

/**
 * This script deploys a minimal instance of the yield v2 protocol, with no oracle sources, assets, joins, series or pools
 * 
 * run:
 * npx hardhat run ./environments/protocol.ts --network localhost
 *
 */

const WETH9 = '0x05E34c8053f9Cb50DFa2726BfD66a03501031b66'

console.time("Protocol deployed in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    await Protocol.setup(ownerAcc, WETH9)
    console.timeEnd("Protocol deployed in")
})()