import { ethers, waffle } from 'hardhat'
import { ETH, DAI, USDC } from '../shared/constants'
import { Series } from '../fixtures/series'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'

/**
 * 
 * README
 * 
 * 
 */
const TST = ethers.utils.formatBytes32String('TST').slice(0, 14)

const cauldronAddress = '0x09635F643e140090A9A8Dcd712eD6285858ceBef'
const ladleAddress = '0xc5a5C42992dECbae36851359345FE25997F5C42d'
const wandAddress = '0xf5059a5D33d5853360D16C683c16e67980206f36'

const series: Array<[string, number, Array<string>]> = [ // baseId, maturity, ilkIds
    [DAI, 1625093999, [USDC, ETH, TST]], // Jun21
    [DAI, 1633042799, [USDC, ETH, TST]], // Sep21
    [USDC, 1625093999, [DAI, ETH, TST]],
    [USDC, 1633042799, [DAI, ETH, TST]]
]


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
    const wand = await ethers.getContractAt('Wand', wandAddress, ownerAcc) as unknown as Wand

    await Series.setup(
        ownerAcc,
        cauldron,
        ladle,
        wand,
        series,
    )
    console.timeEnd("Assets added in")
})()