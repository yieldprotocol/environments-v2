import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle, network } from 'hardhat'
import { bytesToString, verify } from '../shared/helpers'

import { id } from '@yield-protocol/utils-v2'
import { WAD, RATE } from '../shared/constants'

import JoinArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Join.sol/Join.json'
import { IOracle } from '../typechain/IOracle'
import { Cauldron } from '../typechain/Cauldron'
import { Join } from '../typechain/Join'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'

const { deployContract } = waffle

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
    assets: Array<[string, string]>,              // Assets to add to the protocol: [ [assetId, assetAddress], ... ]
    baseIds: Array<string>,                       // Assets to make into bases
    ilkIds: Array<[string, string]>,              // Assets to make into ilks for a given base: [ [baseId, ilkId], ... ]
    rateOracle: IOracle,
    rateSourceAddresses: Map<string, string>,     // baseId => sourceAddress
    chiSourceAddresses: Map<string, string>,      // baseId => sourceAddress
    spotOracle: IOracle,
    spotSourceAddresses: Map<string, Map<string, string>> // baseId,quoteId => sourceAddress
  ) {
    const joins: Map<string, Join> = new Map()

    for (let [assetId, assetAddress] of assets) {
      const symbol = bytesToString(assetId)

      await wand.addAsset(assetId, assetAddress); console.log(`wand.addAsset(${symbol})`)
      
      const join = await ethers.getContractAt('Join', await ladle.joins(assetId), owner) as Join
      verify(join.address, [assetAddress])
      console.log(`Deployed Join for ${symbol} at ${join.address}`)
      joins.set(assetId, join)
    }

    for (let baseId of baseIds) {
      const symbol = bytesToString(baseId)
      const chiSourceAddress = chiSourceAddresses.get(baseId) as string
      const rateSourceAddress = rateSourceAddresses.get(baseId) as string
      await wand.makeBase(baseId, rateOracle.address, rateSourceAddress, chiSourceAddress); console.log(`wand.makeBase(${symbol})`)
    }

    for (let [baseId, ilkId] of ilkIds) {
      const ilkSymbol = bytesToString(ilkId)
      if (baseId === ilkId) continue;
      const ratio = 1000000 //  1000000 == 100% collateralization ratio
      const maxDebt = WAD.mul(1000000)
      const spotSource = (spotSourceAddresses.get(baseId) as Map<string, string>).get(ilkId) as string
      await wand.makeIlk(baseId, ilkId, spotOracle.address, spotSource, ratio, maxDebt); console.log(`wand.makeIlk(${ilkSymbol})`)
    }

    return new Assets(owner, joins)
  }
}
