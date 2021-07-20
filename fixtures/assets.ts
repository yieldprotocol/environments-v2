import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers } from 'hardhat'
import { bytesToString, verify } from '../shared/helpers'

import { IOracle } from '../typechain/IOracle'
import { Join } from '../typechain/Join'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'

import { ERC20Mock } from '../typechain/ERC20Mock'
import { WETH9Mock } from '../typechain/WETH9Mock'
import { ISourceMock } from '../typechain/ISourceMock'

export class Assets {
  owner: SignerWithAddress
  joins: Map<string, Join>
  
  constructor(
    owner: SignerWithAddress,
    joins: Map<string, Join>,
  ) {
    this.owner = owner
    this.joins = joins
  }

  // Integrate a number of assets into a Yield v2 environment
  public static async setup(
    owner: SignerWithAddress,
    ladle: Ladle,
    wand: Wand,
    assets: Map<string, string>,   // Assets to add to the protocol: [ [assetId, assetAddress], ... ]
    baseIds: Array<string>,                       // Assets to make into bases
    ilkIds: Array<[string, string]>,              // Assets to make into ilks for a given base: [ [baseId, ilkId], ... ]
    rateOracle: IOracle,
    rateSources: Map<string, string>,        // baseId => source
    chiSources: Map<string, string>,         // baseId => source
    spotOracle: IOracle,
    spotSources: Map<string, string>         // baseId,quoteId => source
  ) {
    const joins: Map<string, Join> = new Map()

    for (let assetId of assets.keys()) {
      const assetAddress = assets.get(assetId) as string
      const symbol = bytesToString(assetId)

      await wand.addAsset(assetId, assetAddress); console.log(`wand.addAsset(${symbol})`)
      
      const join = await ethers.getContractAt('Join', await ladle.joins(assetId), owner) as Join
      verify(join.address, [assetAddress])
      console.log(`[${symbol}Join, '${join.address}'],`)
      joins.set(assetId, join)
    }

    for (let baseId of baseIds) {
      const symbol = bytesToString(baseId)
      const rateSourceAddress = rateSources.get(baseId) as string
      const chiSourceAddress = chiSources.get(baseId) as string
      await wand.makeBase(baseId, rateOracle.address, rateSourceAddress, chiSourceAddress); console.log(`wand.makeBase(${symbol})`)
    }

    for (let [baseId, ilkId] of ilkIds) {
      const baseSymbol = bytesToString(baseId)
      const ilkSymbol = bytesToString(ilkId)
      if (baseId === ilkId) continue;
      const ratio = 1000000 //  1000000 == 100% collateralization ratio
      const maxDebt = 1000000
      const minDebt = 1
      const debtDec = 18
      const spotSourceAddress = spotSources.get(`${baseId},${ilkId}`) as string
      await wand.makeIlk(baseId, ilkId, spotOracle.address, spotSourceAddress, ratio, maxDebt, minDebt, debtDec); console.log(`wand.makeIlk(${baseSymbol}, ${ilkSymbol})`)
    }

    return new Assets(owner, joins)
  }
}
