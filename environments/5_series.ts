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
const cauldronAddress = '0x5ff6B059f51e580D1da9924b98Ddc0A3Be5C7D0d'
const ladleAddress = '0x074B7c78e96c60709733dc319738E3aD1b6E3E6a'
const poolFactoryAddress = '0x1b91fAB74aCd3754aE82ef7dfBd5C630a83A55B4'

const baseIds: string[] = [DAI, USDC]
const ilkIds: string[] =  [DAI, USDC, ETH, ethers.utils.formatBytes32String('TST').slice(0, 14)]

const chiOracleAddress = '0x27C98AC76D3bcC3b31EFd484678aE8B010b9379c'
const chiSourceAddresses = new Map([
    [DAI, '0x8a20a73DedF99c55B303Db8131A8eCf3C9fe22Cf'],
    [USDC, '0xA0efc9539D30eF85C3b7700C4bB51eAEf92E530F'],
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