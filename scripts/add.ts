import *  as fs from 'fs'

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

function seriesData(hre: HardhatRuntimeEnvironment): Array<string> {
    return [
        stringToBytes6('DAI1', hre),
        stringToBytes6('DAI2', hre),
        stringToBytes6('USDC1', hre),
        stringToBytes6('USDC2', hre),
        stringToBytes6('USDT', hre)
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
const protocol = jsonToMap(fs.readFileSync('output/protocol.json', 'utf8')) as Map<string, string>;

const appendMapToFile = (path: string, map: Map<string, string>) => {
    fs.writeFileSync(path, mapToJson(new Map([...(jsonToMap(fs.readFileSync(path, 'utf8')) as Map<string, string>), ...map])), 'utf8')
}

export const addAsset = async (argv: any, hre: HardhatRuntimeEnvironment) => {

    console.time("Asset added in");
    
    const [ ownerAcc ] = await hre.ethers.getSigners();
    const ladle = await hre.ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const wand = await hre.ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand

    const assets: Map<string, string> = new Map()
    const joins: Map<string, string> = new Map()

    const asset = await hre.ethers.getContractAt('ERC20Mock', argv.asset, ownerAcc) as ERC20Mock
    const symbol = await asset.symbol() as string
    const assetId = stringToBytes6(symbol, hre)

    assets.set(assetId, asset.address)

    // appendMapToFile('output/assets.json', assets)

    await wand.addAsset(assetId, asset.address); console.log(`wand.addAsset(${symbol})`)
    
    const join = await hre.ethers.getContractAt('Join', await ladle.joins(assetId), ownerAcc) as Join
    verify(join.address, [], hre)
    console.log(`[${symbol}Join, '${join.address}'],`)
    joins.set(assetId, join.address)

    // appendMapToFile('output/rateSources.json', rateSources)
    // appendMapToFile('output/chiSources.json', chiSources)
    // appendMapToFile('output/spotSources.json', spotSources)
    // appendMapToFile('output/joins.json', joins)

    console.timeEnd("Base added in")
}

export const makeBase = async (argv: any, hre: HardhatRuntimeEnvironment) => {

    console.time("Base made in");
    
    const [ ownerAcc ] = await hre.ethers.getSigners();
    const wand = await hre.ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const rateChiOracle = await hre.ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as IOracle

    const assets: Map<string, string> = new Map()
    const rateSources: Map<string, string> = new Map()
    const chiSources: Map<string, string> = new Map()

    const asset = await hre.ethers.getContractAt('ERC20Mock', argv.asset, ownerAcc) as ERC20Mock
    const symbol = await asset.symbol() as string
    const assetId = stringToBytes6(symbol, hre)

    assets.set(assetId, asset.address)

    // appendMapToFile('output/assets.json', assets)

    await wand.makeBase(assetId, rateChiOracle.address, argv.rateSource, argv.chiSource); console.log(`wand.makeBase(${symbol})`)

    rateSources.set(assetId, argv.rateSource)
    chiSources.set(assetId, argv.chiSource)

    // appendMapToFile('output/rateSources.json', rateSources)
    // appendMapToFile('output/chiSources.json', chiSources)
    // appendMapToFile('output/spotSources.json', spotSources)
    // appendMapToFile('output/joins.json', joins)

    console.timeEnd("Base made in")
}

export const makeIlk = async (argv: any, hre: HardhatRuntimeEnvironment) => {

    console.time("Ilk made in");

    const [ ownerAcc ] = await hre.ethers.getSigners();   
    const wand = await hre.ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const spotOracle = await hre.ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc) as IOracle

    const spotSources: Map<string, string> = new Map()

    const asset = await hre.ethers.getContractAt('ERC20Mock', argv.asset, ownerAcc) as ERC20Mock
    const assetId = stringToBytes6(await asset.symbol() as string, hre)

    const base = await hre.ethers.getContractAt('ERC20Mock', argv.base, ownerAcc) as ERC20Mock
    const baseId = stringToBytes6(await base.symbol() as string, hre)
  
    const ratio = 1000000 //  1000000 == 100% collateralization ratio
    const maxDebt = 1000000
    const minDebt = 1
    const debtDec = 18
    await wand.makeIlk(baseId, assetId, spotOracle.address, ratio, maxDebt, minDebt, debtDec); console.log(`wand.makeIlk(${await base.symbol()}, ${await asset.symbol()})`)
    spotSources.set(`${baseId},${assetId}`, argv.spotSource)

    // appendMapToFile('output/spotSources.json', spotSources)
    // appendMapToFile('output/joins.json', joins)

    console.timeEnd("Ilk made in")
}

export const addSeries = async (argv: any, hre: HardhatRuntimeEnvironment) => {

    console.time("Series added in");
    
    const [ ownerAcc ] = await hre.ethers.getSigners();
    const cauldron = await hre.ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await hre.ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const wand = await hre.ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc) as unknown as Wand
    const fyTokens: Map<string, string> = new Map()
    const pools: Map<string, string> = new Map()

    const base = await hre.ethers.getContractAt('ERC20Mock', argv.base, ownerAcc) as ERC20Mock
    const symbol = await base.symbol() as string
    const baseId = stringToBytes6(symbol, hre)

    const seriesId = stringToBytes6(argv.seriesId, hre)
    const ilkIds = []
    for (let ilk of argv.ilkIds ) ilkIds.push(stringToBytes6(ilk, hre))

    await wand.addSeries(seriesId, baseId, argv.maturity, ilkIds, argv.seriesId, argv.seriesId)

    const fyToken = await hre.ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, ownerAcc) as FYToken
    console.log(`[${await fyToken.symbol()}, '${fyToken.address}'],`)
    verify(fyToken.address, [
        baseId,
        await fyToken.oracle(),
        await fyToken.join(),
        argv.maturity,
        argv.seriesId,
        argv.seriesId,
    ], hre)

    const pool = await hre.ethers.getContractAt('Pool', await ladle.pools(seriesId), ownerAcc) as Pool
    console.log(`[${await fyToken.symbol()}Pool, '${pool.address}'],`)
    verify(pool.address, [], hre, 'safeERC20Namer.js')

    fyTokens.set(seriesId, fyToken.address)
    pools.set(seriesId, pool.address)

    // appendMapToFile('output/fyTokens.json', fyTokens)
    // appendMapToFile('output/pools.json', pools)

    console.timeEnd("Series added in")
}