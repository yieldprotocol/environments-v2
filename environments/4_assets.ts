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
const cauldronAddress = '0x97fd63D049089cd70D9D139ccf9338c81372DE68'
const ladleAddress = '0xC0BF43A4Ca27e0976195E6661b099742f10507e5'

const assets: Array<[string, string]> =  [ 
    [DAI,'0x627b9A657eac8c3463AD17009a424dFE3FDbd0b1'],
    [USDC,'0x8E45C0936fa1a65bDaD3222bEFeC6a03C83372cE'],
    [ETH,'0xC32609C91d6B6b51D48f2611308FEf121B02041f'],
    [TST, '0x262e2b50219620226C5fB5956432A88fffd94Ba7'],
]
const baseIds: Array<string> = [DAI, USDC]

const rateOracleAddress = '0x85495222Fd7069B987Ca38C2142732EbBFb7175D'
const rateSourceAddresses = new Map([
    [DAI, '0xd753c12650c280383Ce873Cc3a898F6f53973d16'],
    [USDC, '0x3f9A1B67F3a3548e0ea5c9eaf43A402d12b6a273'],
])
const spotOracleAddress = '0x3abBB0D6ad848d64c8956edC9Bf6f18aC22E1485'
const spotSourceAddresses = new Map([
    [DAI, new Map([
        [USDC, '0x4951A1C579039EbfCBA0BE33D2cd3A6D30b0f802'],
        [ETH, '0xb007167714e2940013EC3bb551584130B7497E22'],
        [TST, '0xeC827421505972a2AE9C320302d3573B42363C26'],
    ])],
    [USDC, new Map([
        [DAI, '0x24d41dbc3d60d0784f8a937c59FBDe51440D5140'],
        [ETH, '0x76cec9299B6Fa418dc71416FF353737AB7933A7D'],
        [TST, '0x313F922BE1649cEc058EC0f076664500c78bdc0b'],
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