import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle, network } from 'hardhat'
import { bytesToString, verify } from '../shared/helpers'

import { ERC20Mock } from '../typechain/ERC20Mock'

import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { Pool } from '../typechain/Pool'

export class Series {
  owner: SignerWithAddress
  fyTokens: Map<string, FYToken>
  pools: Map<string, Pool| Map<string, Pool> >
  
  constructor(
    owner: SignerWithAddress,
    fyTokens: Map<string, FYToken>,
    pools: Map<string, Pool | Map<string, Pool> >,
  ) {
    this.owner = owner
    this.fyTokens = fyTokens
    this.pools = pools
  }

  public static async setup(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: Ladle,
    wand: Wand,
    series: Array<[string, number, Array<string>]>, // baseId, maturity, ilkIds, // { maturity1: [ilkId1, ... ] }
  ) {
    // ==== Add assets and joins ====
    const fyTokens: Map<string, FYToken> = new Map()
    const pools: Map<string, Pool> = new Map()

    let index = 1 // For the seriesId and symbol, replace the maturity by its index in the array
    for (let [baseId, maturity, ilkIds] of series) {
      const seriesId = ethers.utils.formatBytes32String(bytesToString(baseId) + index++).slice(0, 14) // baseId + index
      const symbol = bytesToString(seriesId)

      await wand.addSeries(seriesId, baseId, maturity, ilkIds, symbol, symbol)

      const base = await ethers.getContractAt('ERC20Mock', await cauldron.assets(baseId), owner) as ERC20Mock
      const fyToken = await ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, owner) as FYToken
      console.log(`Deployed FYToken ${symbol} at ${fyToken.address}`)

      const pool = await ethers.getContractAt('Pool', await ladle.pools(seriesId), owner) as Pool
      console.log(`Deployed Pool for ${await base.symbol()} and ${await fyToken.symbol()} at ${pool.address}`)

      fyTokens.set(seriesId, fyToken)
      pools.set(baseId, pool)
    }

    return new Series(owner, fyTokens, pools)
  }
}
