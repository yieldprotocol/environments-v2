import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers } from 'hardhat'
import { bytesToString, verify } from '../shared/helpers'

import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { Pool } from '../typechain/Pool'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'

export class Series {
  owner: SignerWithAddress
  fyTokens: Map<string, FYToken>
  pools: Map<string, Pool>
  
  constructor(
    owner: SignerWithAddress,
    fyTokens: Map<string, FYToken>,
    pools: Map<string, Pool>,
  ) {
    this.owner = owner
    this.fyTokens = fyTokens
    this.pools = pools
  }

  public static async setup(
    add_as_ilk: boolean,
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: Ladle,
    wand: Wand,
    safeERC20Namer: SafeERC20Namer,
    series: Array<[string, string, number, Array<string>]>, // seriesId, baseId, maturity, ilkIds, // { maturity1: [ilkId1, ... ] }
  ) {
    const fyTokens: Map<string, FYToken> = new Map()
    const pools: Map<string, Pool> = new Map()
    if (add_as_ilk) {
      for (let [seriesId,,,ilkIds] of series) {
        await cauldron['addIlks(bytes6,bytes6[])'](seriesId, ilkIds)
      }
    } else {
      for (let [seriesId, baseId, maturity, ilkIds] of series) {
        const symbol = bytesToString(seriesId)
  
        await wand.addSeries(seriesId, baseId, maturity, ilkIds, symbol, symbol)
  
        const fyToken = await ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, owner) as FYToken
        console.log(`[${await fyToken.symbol()}, '${fyToken.address}'],`)
        verify(fyToken.address, [
          baseId,
          await fyToken.oracle(),
          await fyToken.join(),
          maturity,
          symbol,
          symbol,
        ])
  
        const pool = await ethers.getContractAt('Pool', await ladle.pools(seriesId), owner) as Pool
        console.log(`[${await fyToken.symbol()}Pool, '${pool.address}'],`)
        verify(pool.address, [], { SafeERC20Namer: safeERC20Namer.address })
  
        fyTokens.set(seriesId, fyToken)
        pools.set(seriesId, pool)
      }
      
      return new Series(owner, fyTokens, pools)
    }
  }
}
