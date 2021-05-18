import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle, network } from 'hardhat'
import { bytesToString, verify } from '../shared/helpers'

import { ERC20Mock } from '../typechain/ERC20Mock'

import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { Pool } from '../typechain/Pool'
import { YieldMath } from '../typechain/YieldMath'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'

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
    yieldMath: YieldMath,
    safeERC20Namer: SafeERC20Namer,
    series: Array<[string, string, number, Array<string>]>, // seriesId, baseId, maturity, ilkIds, // { maturity1: [ilkId1, ... ] }
  ) {
    // ==== Add assets and joins ====
    const fyTokens: Map<string, FYToken> = new Map()
    const pools: Map<string, Pool> = new Map()

    for (let [seriesId, baseId, maturity, ilkIds] of series) {
      const symbol = bytesToString(seriesId)

      await wand.addSeries(seriesId, baseId, maturity, ilkIds, symbol, symbol)

      const base = await ethers.getContractAt('ERC20Mock', await cauldron.assets(baseId), owner) as ERC20Mock
      const fyToken = await ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, owner) as FYToken
      verify(fyToken.address, [
        baseId,
        await fyToken.oracle(),
        await fyToken.join(),
        maturity,
        symbol,
        symbol,
      ])
      console.log(`[${symbol}, '${fyToken.address}'],`)

      const pool = await ethers.getContractAt('Pool', await ladle.pools(seriesId), owner) as Pool
      const poolLibs = {
        YieldMath: yieldMath.address,
        SafeERC20Namer: safeERC20Namer.address,
      }
      verify(pool.address, [], poolLibs)
      console.log(`[${await fyToken.symbol()}Pool, '${pool.address}'],`)

      fyTokens.set(seriesId, fyToken)
      pools.set(seriesId, pool)
    }

    return new Series(owner, fyTokens, pools)
  }
}
