import { ethers, waffle } from 'hardhat'
import { ETH, DAI, USDC } from '../shared/constants'
import { Assets } from '../fixtures/assets'

import { IOracle } from '../typechain/IOracle'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'

/**
 * 
 * README
 * 
 * 
 */
const TST = ethers.utils.formatBytes32String('TST').slice(0, 14)

const ladleAddress = '0x2F4163FA3cb73AD2Be4C63191f34ecE2794b3c4f'
const wandAddress = '0x74469D604633425b1708C0D557d94A40eEAe201f'

const rateChiOracleAddress = '0x87e553A48d2dBe14e8f1BCfA75d2269d64705B2A'
const spotOracleAddress = '0xC9CB02D484955cBfE56Da483D5924d26535a9080'

const assets: Array<[string, string]> =  [
    [DAI, '0x055d6Bc9e56e667d066A80c96B19303310a44433'],
    [USDC,'0xc82F80F7Bf84be6b315F6381A314F0D1C5D9a2ff'],
    [ETH, '0x05E34c8053f9Cb50DFa2726BfD66a03501031b66'],
    [TST, '0x92b320DD0EaDdd2189861C05D6718c385491998F'],
]
const baseIds: Array<string> = [DAI, USDC]
const ilkIds: Array<[string, string]> = [
    [DAI, USDC],
    [DAI, ETH],
    [DAI, TST],
    [USDC, DAI],
    [USDC, ETH],
    [USDC, TST],
]

const rateSourceAddresses = new Map([
    [DAI, '0xE6F7A5f513596C2e10912F0CDBb1C00d3D995948'],
    [USDC, '0x3cD3bC30cA10c740a9B9064b20C735bbD5CDd219'],
])
const chiSourceAddresses = new Map([
    [DAI, '0x2a9D818772e76A11347F36EB5ac0D1ed70337dC8'],
    [USDC, '0xbaA41Ac1AdBa3b16D133BB1F0699134C86a8352b'],
])
const spotSourceAddresses = new Map([
    [DAI, new Map([
        [USDC, '0x0c6772B8508AAe0Fd9562DE3dAa359CD8A43c5c4'],
        [ETH, '0xAe05f8630311DDD62E595d970a85a068546488D1'],
        [TST, '0x6d8d8274879D944Ce48218124e38366bE3C1B57c'],
    ])],
    [USDC, new Map([
        [DAI, '0xAB43F300f247019c6a8f4151e31a19Ca7BB7C40A'],
        [ETH, '0x2132D1d306f20e2A9145918e566685526e556B74'],
        [TST, '0x50B69b2131985D27DDcC4954286CA47C5336147F'],
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
    const ladle = await ethers.getContractAt('Ladle', ladleAddress, ownerAcc) as unknown as Ladle
    const wand = await ethers.getContractAt('Wand', wandAddress, ownerAcc) as unknown as Wand
    const rateChiOracle = await ethers.getContractAt('CompoundMultiOracle', rateChiOracleAddress, ownerAcc) as IOracle
    const spotOracle = await ethers.getContractAt('ChainlinkMultiOracle', spotOracleAddress, ownerAcc) as IOracle

    await Assets.setup(
        ownerAcc,
        ladle,
        wand,
        assets,                 // [ [assetId, assetAddress], ... ]
        baseIds,
        ilkIds,
        rateChiOracle,
        rateSourceAddresses,    // baseId => sourceAddress
        chiSourceAddresses,    // baseId => sourceAddress
        spotOracle,
        spotSourceAddresses     // baseId,quoteId => sourceAddress
    )
    console.timeEnd("Assets added in")
})()