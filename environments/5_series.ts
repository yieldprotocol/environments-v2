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

const toBytes6 = (x: string) => {return ethers.utils.formatBytes32String(x).slice(0, 14)}

const TST = ethers.utils.formatBytes32String('TST').slice(0, 14)

const cauldronAddress = '0xDa22cf5b3E21B55C1FCF4a7c3e2437d319Dd65e3'
const ladleAddress = '0x2F4163FA3cb73AD2Be4C63191f34ecE2794b3c4f'
const wandAddress = '0x74469D604633425b1708C0D557d94A40eEAe201f'

const series: Array<[string, string, number, Array<string>]> = [ // seriesId, baseId, maturity, ilkIds
    [toBytes6('DAI1'), DAI, 1625093999, [USDC, ETH, TST]], // Jun21
    [toBytes6('DAI2'), DAI, 1633042799, [USDC, ETH, TST]], // Sep21
    [toBytes6('USDC1'), USDC, 1625093999, [DAI, ETH, TST]],
    [toBytes6('USDC2'), USDC, 1633042799, [DAI, ETH, TST]]
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