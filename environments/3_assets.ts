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

const ladleAddress = '0xc5a5C42992dECbae36851359345FE25997F5C42d'
const wandAddress = '0xf5059a5D33d5853360D16C683c16e67980206f36'

const rateChiOracleAddress = '0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E'
const spotOracleAddress = '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690'

const assets: Array<[string, string]> =  [
    [DAI, '0x5FbDB2315678afecb367f032d93F642f64180aa3'],
    [USDC,'0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'],
    [ETH, '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'],
    [TST, '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'],
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
    [DAI, '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'],
    [USDC, '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE'],
])
const chiSourceAddresses = new Map([
    [DAI, '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'],
    [USDC, '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c'],
])
const spotSourceAddresses = new Map([
    [DAI, new Map([
        [USDC, '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'],
        [ETH, '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82'],
        [TST, '0x0B306BF915C4d645ff596e518fAf3F9669b97016'],
    ])],
    [USDC, new Map([
        [DAI, '0x59b670e9fA9D0A427751Af201D676719a970857b'],
        [ETH, '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44'],
        [TST, '0x4A679253410272dd5232B3Ff7cF5dbB88f295319'],
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