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
const cauldronAddress = '0x5ff6B059f51e580D1da9924b98Ddc0A3Be5C7D0d'
const ladleAddress = '0x074B7c78e96c60709733dc319738E3aD1b6E3E6a'

const assets: Array<[string, string]> =  [ 
    [DAI,'0x09338a0f228DA35Fc62aFedD2995C8c03937B3f5'],
    [USDC,'0xD2d5499467eAD2c0595CC34ADa0E7E92f240CE04'],
    [ETH,'0x833E4643B90FAcaeC9Aa8dF081eE361AA16EC3d6'],
    [TST, '0x3eBBafCf9404551B0fDd4846ECCD0A917ec7d14C'],
]
const baseIds: Array<string> = [/*DAI, */USDC]

const rateOracleAddress = '0x27C98AC76D3bcC3b31EFd484678aE8B010b9379c'
const rateSourceAddresses = new Map([
    [DAI, '0xe1d01C7AD86f4149bdf2f8530b6F44A97bCECb3D'],
    [USDC, '0xe8DDCbC4C31D82d571dA3a8F42170dA95e1614c3'],
])
const spotOracleAddress = '0x99dBE4AEa58E518C50a1c04aE9b48C9F6354612f'
const spotSourceAddresses = new Map([
    [DAI, new Map([
        [USDC, '0xd3030DF3dfE48F3F1b6a0aa6f4505BaDB863f786'],
        [ETH, '0x7c9cd57f0a2bEcb5326088145883EAdBAA8a9110'],
        [TST, '0xe011B901F9385dD469769A3f88C9f4BC10F0F1c5'],
    ])],
    [USDC, new Map([
        [DAI, '0xA7a2B2304c5FFA9c3c7063E6Bcd7D251b947Aa08'],
        [ETH, '0x3d7b095c827765D4783960A6DD58574e73Cc9256'],
        [TST, '0x320c2795Fd6A7c99907C6E89DeE9e965537Fb485'],
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