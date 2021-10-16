import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { mapToJson, jsonToMap, verify } from '../shared/helpers'

import { YieldMath } from '../typechain/YieldMath'
import { YieldMathExtensions } from '../typechain/YieldMathExtensions'
import { PoolView } from '../typechain/PoolView'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'

/**
 * @dev This script deploys the SafeERC20Namer and YieldMath libraries
 */

(async () => {
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

    let yieldMath: YieldMath
    let yieldMathExtensions: YieldMathExtensions
    let poolView: PoolView
    let safeERC20Namer: SafeERC20Namer

    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMath = ((await YieldMathFactory.deploy()) as unknown) as YieldMath
    await yieldMath.deployed()
    console.log(`[YieldMath, '${yieldMath.address}'],`)
    verify(yieldMath.address, [])

    const YieldMathExtensionsFactory = await ethers.getContractFactory('YieldMathExtensions', {
        libraries: {
            YieldMath: yieldMath.address,
        }
    })
    yieldMathExtensions = ((await YieldMathExtensionsFactory.deploy()) as unknown) as YieldMathExtensions
    await yieldMathExtensions.deployed()
    console.log(`[yieldMathExtensions, '${yieldMathExtensions.address}'],`)
    verify(yieldMathExtensions.address, [], 'yieldMath.js')

    const YieldMathExtensionsWrapperFactory = await ethers.getContractFactory('PoolView', {
        libraries: {
            YieldMathExtensions: yieldMathExtensions.address,
        }
    })
    poolView = ((await YieldMathExtensionsWrapperFactory.deploy()) as unknown) as PoolView
    await poolView.deployed()
    console.log(`[poolView, '${poolView.address}'],`)
    verify(poolView.address, [], 'yieldMathExtensions.js')


    const SafeERC20NamerFactory = await ethers.getContractFactory('SafeERC20Namer')
    safeERC20Namer = ((await SafeERC20NamerFactory.deploy()) as unknown) as SafeERC20Namer
    await safeERC20Namer.deployed()
    console.log(`[SafeERC20Namer, '${safeERC20Namer.address}'],`)
    verify(safeERC20Namer.address, [])

    protocol.set('yieldMath', yieldMath.address)
    protocol.set('yieldMathExtensions', yieldMathExtensions.address)
    protocol.set('poolView', poolView.address)
    protocol.set('safeERC20Namer', safeERC20Namer.address)

    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')

    fs.writeFileSync('./yieldMath.js', `module.exports = { YieldMath: "${ yieldMath.address }" }`, 'utf8')
    fs.writeFileSync('./yieldMathExtensions.js', `module.exports = { YieldMathExtensions: "${ yieldMathExtensions.address }" }`, 'utf8')

    // SafeERC20Namer is a library that is only used in constructors, and needs a special format for etherscan verification
    fs.writeFileSync('./safeERC20Namer.js', `module.exports = { SafeERC20Namer: "${ safeERC20Namer.address }" }`, 'utf8')
})()