import { ethers } from 'hardhat'
import { Protocol } from '../fixtures/protocol'

/**
 * This script deploys a minimal instance of the yield v2 protocol, with no oracle sources, assets, joins, series or pools
 * 
 * run:
 * npx hardhat run ./environments/protocol.ts --network localhost
 *
 */

const WETH9 = '0xb6E464A5FF2bC6117B569dc1EC9Fadd9F694A6dD'

console.time("Protocol deployed in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    await Protocol.setup(ownerAcc, WETH9)
    console.timeEnd("Protocol deployed in")
})()