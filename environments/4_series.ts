import { ethers, waffle } from 'hardhat'
import { ETH, DAI, USDC } from '../shared/constants'
import { Series } from '../fixtures/series'

import { IOracle } from '../typechain/IOracle'
import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { PoolFactory } from '../typechain/PoolFactory'

import { generateMaturities } from '../shared/helpers';

/**
 * 
 * README
 * 
 * 
 */
 const cauldronAddress = '0x09635F643e140090A9A8Dcd712eD6285858ceBef'
 const ladleAddress = '0xc5a5C42992dECbae36851359345FE25997F5C42d'
 const poolFactoryAddress = '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8'

const baseIds: string[] = [DAI, USDC]
const ilkIds: string[] =  [DAI, USDC, ETH, ethers.utils.formatBytes32String('TST').slice(0, 14)]

const chiOracleAddress = '0x7B942D145E0F6dE62076477F031712532d91FbF8'
const chiSourceAddresses = new Map([
    [DAI, '0xADd7B5e5d54f024Fc48783729e86c1C37D52d3CA'],
    [USDC, '0xE8126467AcB26c45556c1337bCbC6c7A1c979479'],
])

const maturities: number[] = []
const numberOfMaturities = 2

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
    const poolFactory = await ethers.getContractAt('PoolFactory', poolFactoryAddress, ownerAcc) as unknown as PoolFactory
    const chiOracle = await ethers.getContractAt('CompoundMultiOracle', chiOracleAddress, ownerAcc) as IOracle

    await Series.setup(
        ownerAcc,
        cauldron,
        ladle,
        poolFactory,
        baseIds,
        ilkIds,
        chiOracle,
        chiSourceAddresses,             // baseId => sourceAddress
        maturities.length ? maturities : await generateMaturities(numberOfMaturities), // if maturities list is empty, generate them
    )
    console.timeEnd("Assets added in")
})()