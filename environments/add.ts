import { boolean } from 'yargs'
import yargs from 'yargs/yargs'

import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap, mapToJson, verify } from '../shared/helpers'
import { baseIds, ilkIds, seriesData } from './config'

import { Assets } from '../fixtures/assets'
import { Mocks } from '../fixtures/mocks'

import { IOracle } from '../typechain/IOracle'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { Join } from '../typechain/Join'
import { ISourceMock } from '../typechain/ISourceMock'
import { Cauldron } from '../typechain/Cauldron'

/* Read in deployment data if available */
const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string, string>;
const chiSources = jsonToMap(fs.readFileSync('./output/chiSources.json', 'utf8')) as Map<string, string>;
const rateSources = jsonToMap(fs.readFileSync('./output/rateSources.json', 'utf8')) as Map<string, string>;
const spotSources = jsonToMap(fs.readFileSync('./output/spotSources.json', 'utf8')) as Map<string, string>;

const addOptions = (yargs) => {
    return yargs.demandOption('asset').demandOption('sources')
}

const addBase = async (argv, ) => {
    console.time("Base added in");
    
    // TODO

    console.timeEnd("Base added in")
}

const addIlk = async (argv) => {
    console.time("Ilk added in");

    const [ ownerAcc ] = await ethers.getSigners();   
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron

    const joins: Map<string, Join> = new Map()
    const spotSources: Map<string, ISourceMock> = new Map()

    const asset = await ethers.getContractAt('ERC20Mock', argv.asset, ownerAcc) as ERC20Mock
    const symbol = await asset.symbol() as string
    const assetId = ethers.utils.formatBytes32String(symbol).slice(0, 14)

    await wand.addAsset(assetId, asset.address); console.log(`wand.addAsset(${symbol})`)
        
    const join = await ethers.getContractAt('Join', await ladle.joins(assetId), ownerAcc) as Join
    verify(join.address, [])
    console.log(`[${symbol}Join, '${join.address}'],`)
    joins.set(assetId, join)
  
    // Ask Alberto about inputting the spot source ABI
    for (let source of argv.sources) {
    //     const baseSymbol = bytesToString(baseId)
    //     const ilkSymbol = bytesToString(ilkId)
    //     if (baseId === ilkId) continue;
    //     const ratio = 1000000 //  1000000 == 100% collateralization ratio
    //     const maxDebt = 1000000
    //     const minDebt = 1
    //     const debtDec = 18
    //     await wand.makeIlk(baseId, ilkId, spotOracle.address, source, ratio, maxDebt, minDebt, debtDec); console.log(`wand.makeIlk(${baseSymbol}, ${ilkSymbol})`)
    //     spotSources.set(`${baseId},${ilkId}`, source)
    }

    let json = fs.readFileSync('./output/spotSources.json', 'utf8')
    const oldSpotSources = jsonToMap(json) as Mocks["spotSources"]
    fs.writeFileSync('./output/spotSources.json', mapToJson(new Map([...oldSpotSources, ...spotSources])), 'utf8')

    json = fs.readFileSync('./output/joins.json', 'utf8')
    const oldJoins = jsonToMap(json) as Assets["joins"]
    fs.writeFileSync('./output/joins.json', mapToJson(new Map([...oldJoins, ...joins])), 'utf8')

    for (let [seriesId,,,ilkIds] of seriesData) {
        await cauldron['addIlks(bytes6,bytes6[])'](seriesId, ilkIds)
    }
    
    console.timeEnd("Ilk added in")
}

(async () => {
    let argv = await yargs(process.argv.slice(2)).command(
        'base',
        'Adds a base to the protocol',
        addOptions,
        addBase
    ).command(
        'ilk',
        'Adds an ilk to the protocol',
        addOptions,
        addIlk
    ).argv
})()