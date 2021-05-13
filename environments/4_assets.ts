import { ethers, waffle } from 'hardhat'
import { ETH, DAI, USDC } from '../shared/constants'
import { Assets } from '../fixtures/assets'

import { IOracle } from '../typechain/IOracle'
import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'

/**
 * 
 * README
 * 
 * 
 */
const TST = ethers.utils.formatBytes32String('TST').slice(0, 14)
const cauldronAddress = '0xe70f935c32dA4dB13e7876795f1e175465e6458e'
const ladleAddress = '0x3C15538ED063e688c8DF3d571Cb7a0062d2fB18D'

const assets: Array<[string, string]> =  [ 
    [DAI,'0xD84379CEae14AA33C123Af12424A37803F885889'],
    [USDC,'0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d'],
    [ETH,'0xC9a43158891282A2B1475592D5719c001986Aaec'],
    [TST, '0x1c85638e118b37167e9298c2268758e058DdfDA0'],
]
const baseIds: Array<string> = [DAI, USDC]

const rateOracleAddress = '0x610178da211fef7d417bc0e6fed39f05609ad788'
const rateSourceAddresses = new Map([
    [DAI, '0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154'],
    [USDC, '0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f'],
])
const spotOracleAddress = '0xb7f8bc63bbcad18155201308c8f3540b07f84f5e'
const spotSourceAddresses = new Map([
    [DAI, new Map([
        [USDC, '0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3'],
        [ETH, '0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650'],
        [TST, '0xFD471836031dc5108809D173A067e8486B9047A3'],
    ])],
    [USDC, new Map([
        [DAI, '0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f'],
        [ETH, '0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6'],
        [TST, '0x4C4a2f8c81640e47606d3fd77B353E87Ba015584'],
    ])],
])

 /**
 * 
 * run:
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

console.time("Assets added in");

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();    
    const cauldron = await ethers.getContractAt('Cauldron', cauldronAddress, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', ladleAddress, ownerAcc) as unknown as Ladle
    const rateOracle = await ethers.getContractAt('CompoundMultiOracle', rateOracleAddress, ownerAcc) as IOracle
    const spotOracle = await ethers.getContractAt('ChainlinkMultiOracle', spotOracleAddress, ownerAcc) as IOracle

    await Assets.setup(
        ownerAcc,
        cauldron,
        ladle,
        assets,                 // [ [assetId, assetAddress], ... ]
        baseIds,
        rateOracle,
        rateSourceAddresses,    // baseId => sourceAddress
        spotOracle,
        spotSourceAddresses     // baseId,quoteId => sourceAddress
    )
    console.timeEnd("Assets added in")
})()