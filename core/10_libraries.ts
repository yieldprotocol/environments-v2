import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { mapToJson, jsonToMap, verify } from '../shared/helpers'

import { YieldMath } from '../typechain/YieldMath'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'

/**
 * This script deploys the SafeERC20Namer and YieldMath libraries
 */

(async () => {
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

    let safeERC20Namer: SafeERC20Namer
    let yieldMath: YieldMath

    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMath = ((await YieldMathFactory.deploy()) as unknown) as YieldMath
    await yieldMath.deployed()
    console.log(`[YieldMath, '${yieldMath.address}'],`)
    verify(yieldMath.address, [])

    const SafeERC20NamerFactory = await ethers.getContractFactory('SafeERC20Namer')
    safeERC20Namer = ((await SafeERC20NamerFactory.deploy()) as unknown) as SafeERC20Namer
    await safeERC20Namer.deployed()
    console.log(`[SafeERC20Namer, '${safeERC20Namer.address}'],`)
    verify(safeERC20Namer.address, [])

    protocol.set('yieldMath', yieldMath.address)
    protocol.set('safeERC20Namer', safeERC20Namer.address)

    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')

    // SafeERC20Namer is a library that is only used in constructors, and needs a special format for etherscan verification
    fs.writeFileSync('./safeERC20Namer.js', `module.exports = { SafeERC20Namer: "${ safeERC20Namer.address }" }`, 'utf8')
})()