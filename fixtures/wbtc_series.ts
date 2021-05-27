import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { bytesToString, jsonToMap, verify } from '../shared/helpers'
import { DAI, USDC, WBTC } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { Pool } from '../typechain/Pool'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'
import { Mocks } from './mocks'
import { ERC20Mock } from '../typechain/ERC20Mock'

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
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: Ladle,
    wand: Wand,
    safeERC20Namer: SafeERC20Namer,
    series: Array<[string, string, number, Array<string>]>, // seriesId, baseId, maturity, ilkIds, // { maturity1: [ilkId1, ... ] }
  ) {
    // ==== Add assets and joins ====
    for (let [seriesId,,,] of series) {
      await cauldron['addIlks(bytes6,bytes6[])'](seriesId, [WBTC])
    }
    // return new Series(owner, fyTokens, pools)
  }
}
