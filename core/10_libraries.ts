import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { mapToJson, jsonToMap, verify } from '../shared/helpers'

import { YieldMath } from '../typechain/YieldMath'
import { PoolExtensions } from '../typechain/PoolExtensions'
import { PoolExtensionsWrapper } from '../typechain/PoolExtensionsWrapper'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'

/**
 * @dev This script deploys the SafeERC20Namer and YieldMath libraries
 */

(async () => {
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

    let yieldMath: YieldMath
    let poolExtensions: PoolExtensions
    let poolExtensionsWrapper: PoolExtensionsWrapper
    let safeERC20Namer: SafeERC20Namer

    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMath = ((await YieldMathFactory.deploy()) as unknown) as YieldMath
    await yieldMath.deployed()
    console.log(`[YieldMath, '${yieldMath.address}'],`)
    verify(yieldMath.address, [])

    const PoolExtensionsFactory = await ethers.getContractFactory('PoolExtensions', {
        libraries: {
            YieldMath: yieldMath.address,
        }
    })
    poolExtensions = ((await PoolExtensionsFactory.deploy()) as unknown) as PoolExtensions
    await poolExtensions.deployed()
    console.log(`[poolExtensions, '${poolExtensions.address}'],`)
    verify(poolExtensions.address, [], 'yieldMath.js')

    const PoolExtensionsWrapperFactory = await ethers.getContractFactory('PoolExtensionsWrapper', {
        libraries: {
            PoolExtensions: poolExtensions.address,
        }
    })
    poolExtensionsWrapper = ((await PoolExtensionsWrapperFactory.deploy()) as unknown) as PoolExtensionsWrapper
    await poolExtensionsWrapper.deployed()
    console.log(`[poolExtensionsWrapper, '${poolExtensionsWrapper.address}'],`)
    verify(poolExtensionsWrapper.address, [], 'poolExtensions.js')


    const SafeERC20NamerFactory = await ethers.getContractFactory('SafeERC20Namer')
    safeERC20Namer = ((await SafeERC20NamerFactory.deploy()) as unknown) as SafeERC20Namer
    await safeERC20Namer.deployed()
    console.log(`[SafeERC20Namer, '${safeERC20Namer.address}'],`)
    verify(safeERC20Namer.address, [])

    protocol.set('yieldMath', yieldMath.address)
    protocol.set('poolExtensions', poolExtensions.address)
    protocol.set('poolExtensionsWrapper', poolExtensionsWrapper.address)
    protocol.set('safeERC20Namer', safeERC20Namer.address)

    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')

    fs.writeFileSync('./yieldMath.js', `module.exports = { YieldMath: "${ yieldMath.address }" }`, 'utf8')
    fs.writeFileSync('./poolExtensions.js', `module.exports = { PoolExtensions: "${ poolExtensions.address }" }`, 'utf8')

    // SafeERC20Namer is a library that is only used in constructors, and needs a special format for etherscan verification
    fs.writeFileSync('./safeERC20Namer.js', `module.exports = { SafeERC20Namer: "${ safeERC20Namer.address }" }`, 'utf8')
})()