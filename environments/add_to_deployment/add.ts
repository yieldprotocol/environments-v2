import { boolean } from 'yargs'
import yargs from 'yargs/yargs'

import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { bytesToString, jsonToMap, mapToJson, stringToBytes6, verify } from '../../shared/helpers'
import { baseIds, ilkIds, seriesData } from '../config'

import { Assets } from '../../fixtures/assets'
import { Mocks } from '../../fixtures/mocks'

import { IOracle } from '../../typechain/IOracle'
import { Ladle } from '../../typechain/Ladle'
import { Wand } from '../../typechain/Wand'
import { ERC20Mock } from '../../typechain/ERC20Mock'
import { Join } from '../../typechain/Join'
import { ISourceMock } from '../../typechain/ISourceMock'
import { Cauldron } from '../../typechain/Cauldron'
import { FYToken } from '../../typechain/FYToken'
import { Pool } from '../../typechain/Pool'
import { SafeERC20Namer } from '../../typechain/SafeERC20Namer'

/* Read in deployment data if available */
const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;

const appendMapToFile = (path: string, map: Map<string, string>) => {
    fs.writeFileSync(path, mapToJson(new Map([...(jsonToMap(fs.readFileSync(path, 'utf8')) as Map<string, string>), ...map])), 'utf8')
}

const addMaturity = (yargs) => {
    return yargs.demandOption('maturity')
}

const addOptions = (yargs) => {
    return yargs.demandOption('asset').demandOption('sources').demandOption('counters')
}

const addBase = async (argv) => {
    console.time("Base added in");
    
    const [ ownerAcc ] = await ethers.getSigners();
    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const rateChiOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as IOracle
    const spotOracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc) as IOracle
    const safeERC20Namer = await ethers.getContractAt('SafeERC20Namer', protocol.get('safeERC20Namer') as string, ownerAcc) as unknown as SafeERC20Namer

    const joins: Map<string, string> = new Map()
    const rateSources: Map<string, string> = new Map()
    const chiSources: Map<string, string> = new Map()
    const spotSources: Map<string, string> = new Map()
    const fyTokens: Map<string, string> = new Map()
    const pools: Map<string, string> = new Map()

    const asset = await ethers.getContractAt('ERC20Mock', argv.asset, ownerAcc) as ERC20Mock
    const symbol = await asset.symbol() as string
    const assetId = ethers.utils.formatBytes32String(symbol).slice(0, 14)

    await wand.addAsset(assetId, asset.address); console.log(`wand.addAsset(${symbol})`)
    
    const join = await ethers.getContractAt('Join', await ladle.joins(assetId), ownerAcc) as Join
    verify(join.address, [])
    console.log(`[${symbol}Join, '${join.address}'],`)
    joins.set(assetId, join.address)

    await wand.makeBase(assetId, rateChiOracle.address, argv.sources[0], argv.sources[1]); console.log(`wand.makeBase(${symbol})`)

    rateSources.set(assetId, argv.sources[0])
    chiSources.set(assetId, argv.sources[1])

    for (let [source, ilk] of argv.sources.slice(2).map((s, i) => [s, argv.counters[i]])) {
      const ilkId = ethers.utils.formatBytes32String(ilk).slice(0, 14)
      if (assetId === ilkId) continue;
      const ratio = 1000000 //  1000000 == 100% collateralization ratio
      const maxDebt = 1000000
      const minDebt = 1
      const debtDec = 18
      await wand.makeIlk(assetId, ilkId, spotOracle.address, source, ratio, maxDebt, minDebt, debtDec); console.log(`wand.makeIlk(${symbol}, ${ilk})`)
      spotSources.set(`${assetId},${ilkId}`, source)
    }

    appendMapToFile('./output/rateSources.json', rateSources)
    appendMapToFile('./output/chiSources.json', chiSources)
    appendMapToFile('./output/spotSources.json', spotSources)
    appendMapToFile('./output/joins.json', joins)

    for (let ilk of argv.counters ) {
        const seriesId = stringToBytes6(symbol)
        const ilkId = ethers.utils.formatBytes32String(ilk).slice(0, 14)

        await wand.addSeries(seriesId, assetId, argv.maturity, ilkId, symbol, symbol)

        const fyToken = await ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, ownerAcc) as FYToken
        console.log(`[${await fyToken.symbol()}, '${fyToken.address}'],`)
        verify(fyToken.address, [
            assetId,
            await fyToken.oracle(),
            await fyToken.join(),
            argv.maturity,
            symbol,
            symbol,
        ])

        const pool = await ethers.getContractAt('Pool', await ladle.pools(seriesId), ownerAcc) as Pool
        console.log(`[${await fyToken.symbol()}Pool, '${pool.address}'],`)
        verify(pool.address, [], { SafeERC20Namer: safeERC20Namer.address })

        fyTokens.set(seriesId, fyToken.address)
        pools.set(seriesId, pool.address)
    }

    appendMapToFile('./output/fyTokens.json', fyTokens)
    appendMapToFile('./output/pools.json', pools)

    console.timeEnd("Base added in")
}

const addIlk = async (argv) => {
    console.time("Ilk added in");

    const [ ownerAcc ] = await ethers.getSigners();   
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const spotOracle = await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc) as IOracle

    const joins: Map<string, string> = new Map()
    const spotSources: Map<string, string> = new Map()

    const asset = await ethers.getContractAt('ERC20Mock', argv.asset, ownerAcc) as ERC20Mock
    const symbol = await asset.symbol() as string
    const assetId = ethers.utils.formatBytes32String(symbol).slice(0, 14)

    await wand.addAsset(assetId, asset.address); console.log(`wand.addAsset(${symbol})`)
        
    const join = await ethers.getContractAt('Join', await ladle.joins(assetId), ownerAcc) as Join
    verify(join.address, [])
    console.log(`[${symbol}Join, '${join.address}'],`)
    joins.set(assetId, join.address)
  
    for (let [source, base] of argv.sources.map((s, i) => [s, argv.counters[i]])) {
        const baseId = ethers.utils.formatBytes32String(base).slice(0, 14)
        if (baseId === assetId) continue;
        const ratio = 1000000 //  1000000 == 100% collateralization ratio
        const maxDebt = 1000000
        const minDebt = 1
        const debtDec = 18
        await wand.makeIlk(baseId, assetId, spotOracle.address, source, ratio, maxDebt, minDebt, debtDec); console.log(`wand.makeIlk(${base}, ${symbol})`)
        spotSources.set(`${baseId},${assetId}`, source)
    }

    appendMapToFile('./output/spotSources.json', spotSources)
    appendMapToFile('./output/joins.json', joins)

    for (let [seriesId,,,] of seriesData) {
        await cauldron['addIlks(bytes6,bytes6[])'](seriesId, [assetId])
    }
    
    console.timeEnd("Ilk added in")
}

(async () => {
    let argv = await yargs(process.argv.slice(2)).command(
        'base',
        'Adds a base to the protocol',
        (yargs) => { return addMaturity(addOptions(yargs)) },
        addBase
    ).command(
        'ilk',
        'Adds an ilk to the protocol',
        addOptions,
        addIlk
    ).argv
})()