import *  as fs from 'fs'

import { WAD, ETH, DAI, USDC } from '../shared/constants'

import { IOracle } from '../typechain/IOracle'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { Join } from '../typechain/Join'
import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'
import { Pool } from '../typechain/Pool'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

function stringToBytes6(x: string, hre: HardhatRuntimeEnvironment): string {
    return hre.ethers.utils.formatBytes32String(x).slice(0, 14)
}

function seriesData(hre: HardhatRuntimeEnvironment): Array<[string, string, number, Array<string>]> {

    const TST = stringToBytes6('TST', hre)

    return [ // seriesId, baseId, maturity, ilkIds
        [stringToBytes6('DAI1', hre), DAI, 1625093999, [USDC, ETH, TST]], // Jun21
        [stringToBytes6('DAI2', hre), DAI, 1633042799, [USDC, ETH, TST]], // Sep21
        [stringToBytes6('USDC1', hre), USDC, 1625093999, [DAI, ETH, TST]],
        [stringToBytes6('USDC2', hre), USDC, 1633042799, [DAI, ETH, TST]]
    ]
}

function verify(address: string, args: any, hre: HardhatRuntimeEnvironment, libs?: any) {
    if (hre.network.name !== 'localhost') {
        setTimeout(() => { hre.run("verify:verify", {
            address: address,
            constructorArguments: args,
            libraries: libs,
        }) }, 60000)
    }  
}

function flattenContractMap(map: Map<string,any>): Map<string, string> {
    const flat = new Map<string, string>()
    map.forEach((value: any, key: string) => {
      flat.set(key, value.address !== undefined ? value.address : value)
    })
    return flat
}

/* MAP to Json for file export */
function mapToJson(map: Map<any,any>) : string {
    return JSON.stringify(flattenContractMap(map),
      /* replacer */
      (key: any, value: any) =>  {
        if(value instanceof Map) {
          return {
            dataType: 'Map',
            value:  [...value],
          };
        } else {
          return value;
        }
      });
}

function jsonToMap(json:string) : Map<any,any> {
    return JSON.parse(json, 
        /* revivor */
        (key: any, value: any) =>  {
            if(typeof value === 'object' && value !== null) {
                if (value.dataType === 'Map') {
                    return new Map(value.value);
                }
            }
            return value;
        }); 
}

/* Read in deployment data if available */
const protocol = jsonToMap(fs.readFileSync('output/kovan/rc6.3/protocol.json', 'utf8')) as Map<string, string>;

const appendMapToFile = (path: string, map: Map<string, string>) => {
    fs.writeFileSync(path, mapToJson(new Map([...(jsonToMap(fs.readFileSync(path, 'utf8')) as Map<string, string>), ...map])), 'utf8')
}

export const addBase = async (argv: any, hre: HardhatRuntimeEnvironment) => {

    console.time("Base added in");
    
    const [ ownerAcc ] = await hre.ethers.getSigners();
    const cauldron = await hre.ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await hre.ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const wand = await hre.ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const rateChiOracle = await hre.ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as IOracle
    const spotOracle = await hre.ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc) as IOracle
    const safeERC20Namer = await hre.ethers.getContractAt('SafeERC20Namer', protocol.get('safeERC20Namer') as string, ownerAcc) as unknown as SafeERC20Namer

    const joins: Map<string, string> = new Map()
    const rateSources: Map<string, string> = new Map()
    const chiSources: Map<string, string> = new Map()
    const spotSources: Map<string, string> = new Map()
    const fyTokens: Map<string, string> = new Map()
    const pools: Map<string, string> = new Map()

    const asset = await hre.ethers.getContractAt('ERC20Mock', argv.asset, ownerAcc) as ERC20Mock
    const symbol = await asset.symbol() as string
    const assetId = stringToBytes6(symbol, hre)

    await wand.addAsset(assetId, asset.address); console.log(`wand.addAsset(${symbol})`)
    
    const join = await hre.ethers.getContractAt('Join', await ladle.joins(assetId), ownerAcc) as Join
    verify(join.address, [], hre)
    console.log(`[${symbol}Join, '${join.address}'],`)
    joins.set(assetId, join.address)

    await wand.makeBase(assetId, rateChiOracle.address, argv.sources[0], argv.sources[1]); console.log(`wand.makeBase(${symbol})`)

    rateSources.set(assetId, argv.sources[0])
    chiSources.set(assetId, argv.sources[1])

    for (let [source, ilk] of argv.sources.slice(2).map((s: any, i: any) => [s, argv.counters[i]])) {
      const ilkId = stringToBytes6(ilk, hre)
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

    const seriesId = stringToBytes6(symbol, hre)
    const ilkIds = []
    for (let ilk of argv.counters ) ilkIds.push(stringToBytes6(ilk, hre))

    await wand.addSeries(seriesId, assetId, argv.maturity, ilkIds, symbol, symbol)

    const fyToken = await hre.ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, ownerAcc) as FYToken
    console.log(`[${await fyToken.symbol()}, '${fyToken.address}'],`)
    verify(fyToken.address, [
        assetId,
        await fyToken.oracle(),
        await fyToken.join(),
        argv.maturity,
        symbol,
        symbol,
    ], hre)

    const pool = await hre.ethers.getContractAt('Pool', await ladle.pools(seriesId), ownerAcc) as Pool
    console.log(`[${await fyToken.symbol()}Pool, '${pool.address}'],`)
    verify(pool.address, [], hre, { SafeERC20Namer: safeERC20Namer.address })

    fyTokens.set(seriesId, fyToken.address)
    pools.set(seriesId, pool.address)

    appendMapToFile('./output/fyTokens.json', fyTokens)
    appendMapToFile('./output/pools.json', pools)

    console.timeEnd("Base added in")
}

export const addIlk = async (argv: any, hre: HardhatRuntimeEnvironment) => {

    console.time("Ilk added in");

    const [ ownerAcc ] = await hre.ethers.getSigners();   
    const ladle = await hre.ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const wand = await hre.ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const cauldron = await hre.ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const spotOracle = await hre.ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc) as IOracle

    const joins: Map<string, string> = new Map()
    const spotSources: Map<string, string> = new Map()

    const asset = await hre.ethers.getContractAt('ERC20Mock', argv.asset, ownerAcc) as ERC20Mock
    const symbol = await asset.symbol() as string
    const assetId = stringToBytes6(symbol, hre)

    await wand.addAsset(assetId, asset.address); console.log(`wand.addAsset(${symbol})`)
        
    const join = await hre.ethers.getContractAt('Join', await ladle.joins(assetId) as string, ownerAcc) as Join
    verify(join.address, [], hre)
    console.log(`[${symbol}Join, '${join.address}'],`)
    joins.set(assetId, join.address)
  
    for (let [source, base] of argv.sources.map((s: any, i: any) => [s, argv.counters[i]])) {
        const baseId = stringToBytes6(base, hre)
        if (baseId === assetId) continue;
        const ratio = 1000000 //  1000000 == 100% collateralization ratio
        const maxDebt = 1000000
        const minDebt = 1
        const debtDec = 18
        await wand.makeIlk(baseId, assetId, spotOracle.address, source as string, ratio, maxDebt, minDebt, debtDec); console.log(`wand.makeIlk(${base}, ${symbol})`)
        spotSources.set(`${baseId},${assetId}`, source)
    }

    appendMapToFile('./output/spotSources.json', spotSources)
    appendMapToFile('./output/joins.json', joins)

    for (let [seriesId,,,] of seriesData(hre)) {
        await cauldron['addIlks(bytes6,bytes6[])'](seriesId, [assetId])
    }
    
    console.timeEnd("Ilk added in")
}