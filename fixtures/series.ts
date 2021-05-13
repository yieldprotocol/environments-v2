import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle, network } from 'hardhat'

import { id } from '@yield-protocol/utils-v2'
import { CHI } from '../shared/constants'
import FYTokenArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/FYToken.sol/FYToken.json'

import { ERC20Mock } from '../typechain/ERC20Mock'

import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'
import { IOracle } from '../typechain/IOracle'
import { Join } from '../typechain/Join'
import { Ladle } from '../typechain/Ladle'

import { Pool } from '../typechain/Pool'
import { PoolFactory } from '../typechain/PoolFactory'

const { deployContract } = waffle

function bytesToString(bytes: string): string {
  return ethers.utils.parseBytes32String(bytes + '0'.repeat(66 - bytes.length))
}

function toBytes6(bytes: string): string {
  return bytes + '0'.repeat(14 - bytes.length)
}

export class Series {
  owner: SignerWithAddress
  series: Map<string, FYToken>
  pools: Map<string, Pool| Map<string, Pool> >
  
  constructor(
    owner: SignerWithAddress,
    series: Map<string, FYToken>,
    pools: Map<string, Pool | Map<string, Pool> >,
  ) {
    this.owner = owner
    this.series = series
    this.pools = pools
  }

  public static async addChiOracle(oracle: IOracle, baseId: string, chiSourceAddress: string) {
    await oracle.setSources([baseId], [CHI], [chiSourceAddress]); console.log(`oracle.setSources`)
  }

  public static async addSeries(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: Ladle,
    baseJoin: Join,
    chiOracle: IOracle,
    seriesId: string,
    baseId: string,
    ilkIds: Array<string>,
    maturity: number,
  ) {

    const fyToken = (await deployContract(owner, FYTokenArtifact, [
      baseId,
      chiOracle.address,
      baseJoin.address,
      maturity,
      seriesId,
      seriesId,
    ])) as FYToken
    console.log(`Deployed ${bytesToString(seriesId)} FYtoken at ${fyToken.address}`)

    // Add fyToken/series to the Cauldron
    await cauldron.addSeries(seriesId, baseId, fyToken.address); console.log(`cauldron.addSeries(${seriesId}, ${baseId}, fyToken)`)

    // Add all ilks to each series
    if (ilkIds.includes(baseId)) ilkIds.splice(ilkIds.indexOf(baseId), 1) // Remove baseId from the ilkIds, if present
    await cauldron.addIlks(seriesId, ilkIds); console.log('cauldron.addIlks')
    await baseJoin.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], fyToken.address); console.log('cauldron.grantRoles(fyToken)')
    await fyToken.grantRoles([id('mint(address,uint256)'), id('burn(address,uint256)')], ladle.address); console.log('cauldron.grantRoles(ladle)')
    console.log(`Deployed series ${seriesId} for ${baseId} and ${maturity} at ${fyToken.address}`)
    return fyToken
  }

  public static async addPool(
    owner: SignerWithAddress,
    ladle: Ladle,
    base: ERC20Mock,
    fyToken: FYToken,
    seriesId: string,
    poolFactory: PoolFactory,
  ) {
    // deploy base/fyToken Pool
    const calculatedAddress = await poolFactory.calculatePoolAddress(base.address, fyToken.address)
    await poolFactory.createPool(base.address, fyToken.address)
    console.log(`Deployed Pool for ${await base.symbol()} and ${await fyToken.symbol()} at ${calculatedAddress}`)
    const pool = (await ethers.getContractAt('Pool', calculatedAddress, owner) as unknown) as Pool
    
    await ladle.addPool(seriesId, pool.address); console.log(`ladle.addPool(${bytesToString(seriesId)}, pool.address)`)
    console.log(`Deployed Pool for series ${bytesToString(seriesId)} at ${pool.address}`)
    return pool
  }

  // Set up a test environment. Provide at least one asset identifier.
  public static async setup(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: Ladle,
    poolFactory: PoolFactory,
    baseIds: Array<string>,
    ilkIds: Array<string>,
    chiOracle: IOracle,
    chiSourceAddresses: Map<string, string>,             // baseId => sourceAddress
    maturities: Array<number>,
  ) {
    // ==== Add assets and joins ====
    const series: Map<string, FYToken> = new Map()
    const pools: Map<string, Pool> = new Map()

    for ( let baseId of baseIds ) {

      // ==== Get Base contract, and Ilks  ====

      // Get the base and base join
      const base = await ethers.getContractAt('ERC20Mock', await cauldron.assets(baseId), owner) as ERC20Mock
      const baseJoin = await ethers.getContractAt('Join', await ladle.joins(baseId), owner) as Join

      // ==== Add oracles ====
      await this.addChiOracle(chiOracle, baseId, chiSourceAddresses.get(baseId) as string)

      // ==== Add series and pools ====
      // For each series identifier we create a fyToken with the first asset as underlying.
      let index = 1
      for (let maturity of maturities) {

        const seriesId = ethers.utils.formatBytes32String(bytesToString(baseId) + index++).slice(0, 14) // baseId + index

        const fyToken = await this.addSeries(owner, cauldron, ladle, baseJoin, chiOracle, seriesId, baseId, ilkIds, maturity) as FYToken
        series.set(seriesId, fyToken)
        
        // Add a pool between the base and each series 
        // note: pools structure is Map<string, Map<string, Pool>>
        const baseMap = pools.get(baseId) || new Map();
        const pool = await this.addPool(
          owner, 
          ladle, 
          base, 
          fyToken, 
          seriesId, 
          poolFactory,
        )
        pools.set(baseId, baseMap.set(seriesId, pool ))
      }
  }

    return new Series(owner, series, pools)
  }
}
