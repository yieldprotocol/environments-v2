import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, mapToJson } from '../shared/helpers'
import { baseIds, ilkIds, TST } from './config'
import { ETH, DAI, USDC } from '../shared/constants'

import { Protocol } from '../fixtures/protocol'
import { Assets } from '../fixtures/assets'

import { IOracle } from '../typechain/IOracle'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { WETH9Mock } from '../typechain/WETH9Mock'
import { ISourceMock } from '../typechain/ISourceMock'

/**
 * 
 * README
 * 
 * 
 */

const json = fs.readFileSync('protocol.json', 'utf8')
const protocol = JSON.parse(json, jsonToMap) as Protocol;

// Define baseIds or ilkIds manually if needed to continue an aborted deployment

const assetAddresses: Array<[string, string]> =  [
    [DAI, '0x09635F643e140090A9A8Dcd712eD6285858ceBef'],
    [USDC, '0x67d269191c92Caf3cD7723F116c85e6E9bf55933'],
    [ETH, '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690'],
    [TST, '0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB'],
]

const rateSourceAddresses = new Map([
    [DAI, '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9'],
    [USDC, '0x851356ae760d987E095750cCeb3bC6014560891C'],
])
const chiSourceAddresses = new Map([
    [DAI, '0x95401dc811bb5740090279Ba06cfA8fcF6113778'],
    [USDC, '0x70e0bA845a1A0F2DA3359C97E0285013525FFC49'],
])
const spotSourceAddresses = new Map([
    [`${DAI},${USDC}`, '0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf'],
    [`${DAI},${ETH}`, '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf'],
    [`${DAI},${TST}`, '0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00'],
    [`${USDC},${DAI}`, '0x809d550fca64d94Bd9F66E60752A544199cfAC3D'],
    [`${USDC},${ETH}`, '0x1291Be112d480055DaFd8a610b7d1e203891C274'],
    [`${USDC},${TST}`, '0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575'],
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
    const ladle = await ethers.getContractAt('Ladle', protocol.ladle.address, ownerAcc) as unknown as Ladle
    const wand = await ethers.getContractAt('Wand', protocol.wand.address, ownerAcc) as unknown as Wand
    const rateChiOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.compoundOracle.address, ownerAcc) as IOracle
    const spotOracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.chainlinkOracle.address, ownerAcc) as IOracle
    const assets: Map<string, ERC20Mock | WETH9Mock> = new Map()
    assetAddresses.forEach(async ([assetId, address]) => {
        if (assetId === ETH) assets.set(assetId, await ethers.getContractAt('WETH9Mock', address, ownerAcc) as WETH9Mock)
        else assets.set(assetId, await ethers.getContractAt('ERC20Mock', address, ownerAcc) as ERC20Mock)
    })
    const rateSources: Map<string, ISourceMock> = new Map()
    for (let baseId of rateSourceAddresses.keys()) {
        const source = rateSourceAddresses.get(baseId) as string
        rateSources.set(baseId, await ethers.getContractAt('ISourceMock', source, ownerAcc) as ISourceMock)
    }
    const chiSources: Map<string, ISourceMock> = new Map()
    for (let baseId of chiSourceAddresses.keys()) {
        const source = chiSourceAddresses.get(baseId) as string
        chiSources.set(baseId, await ethers.getContractAt('ISourceMock', source, ownerAcc) as ISourceMock)
    }
    const spotSources: Map<string, ISourceMock> = new Map()
    for (let baseIlkId of spotSourceAddresses.keys()) {
        const source = chiSourceAddresses.get(baseIlkId) as string
        spotSources.set(baseIlkId, await ethers.getContractAt('ISourceMock', source, ownerAcc) as ISourceMock)
    }

    const joins = await Assets.setup(
        ownerAcc,
        ladle,
        wand,
        assets,                 // [ [assetId, assetAddress], ... ]
        baseIds,
        ilkIds,
        rateChiOracle,
        rateSources,    // baseId => sourceAddress
        chiSources,    // baseId => sourceAddress
        spotOracle,
        spotSources     // baseId,quoteId => sourceAddress
    )
    fs.writeFileSync('joins.json', JSON.stringify(joins, mapToJson), 'utf8')
    console.timeEnd("Assets added in")
})()