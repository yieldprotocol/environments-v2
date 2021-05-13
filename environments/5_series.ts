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
const cauldronAddress = '0x97fd63D049089cd70D9D139ccf9338c81372DE68'
const ladleAddress = '0xC0BF43A4Ca27e0976195E6661b099742f10507e5'
const poolFactoryAddress = '0x9d136eEa063eDE5418A6BC7bEafF009bBb6CFa70'

const baseIds: string[] = [DAI, USDC]
const ilkIds: string[] =  [DAI, USDC, ETH, ethers.utils.formatBytes32String('TST').slice(0, 14)]

const chiOracleAddress = '0x85495222Fd7069B987Ca38C2142732EbBFb7175D'
const chiSourceAddresses = new Map([
    [DAI, '0xd30bF3219A0416602bE8D482E0396eF332b0494E'],
    [USDC, '0x4DAf17c8142A483B2E2348f56ae0F2cFDAe22ceE'],
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