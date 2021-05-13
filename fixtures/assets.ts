import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle, network } from 'hardhat'

import { id } from '@yield-protocol/utils-v2'
import { WAD, RATE } from '../shared/constants'

import JoinArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Join.sol/Join.json'
import { IOracle } from '../typechain/IOracle'
import { Cauldron } from '../typechain/Cauldron'
import { Join } from '../typechain/Join'
import { Ladle } from '../typechain/Ladle'

const { deployContract } = waffle

function bytesToString(bytes: string): string {
  return ethers.utils.parseBytes32String(bytes + '0'.repeat(66 - bytes.length))
}

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

  public static async addAsset(cauldron: Cauldron, assetId: string, assetAddress: string) {
    await cauldron.addAsset(assetId, assetAddress); console.log('cauldron.addAsset')
  }

  public static async addJoin(owner: SignerWithAddress, ladle: Ladle, assetId: string, assetAddress: string) {
    const symbol = bytesToString(assetId)
    const join = (await deployContract(owner, JoinArtifact, [assetAddress])) as Join
    console.log(`Deployed Join for ${symbol} at ${join.address}`)
    await ladle.addJoin(assetId, join.address); console.log('ladle.addJoin')
    await join.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], ladle.address); console.log('join.grantRoles(ladle)')
    return join
  }

  public static async addRateOracle(cauldron: Cauldron, oracle: IOracle, baseId: string, sourceAddress: string) {
    await oracle.setSources([baseId], [RATE], [sourceAddress]); console.log(`oracle.setSources`)
    await cauldron.setRateOracle(baseId, oracle.address); console.log(`cauldron.setRateOracle`)
  }

  public static async addSpotOracle(cauldron: Cauldron, oracle: IOracle, baseId: string, ilkId: string, sourceAddress: string) {
    const ratio = 1000000 //  1000000 == 100% collateralization ratio
    await oracle.setSources([baseId], [ilkId], [sourceAddress]); console.log(`oracle.setSources`)
    await cauldron.setSpotOracle(baseId, ilkId, oracle.address, ratio); console.log(`cauldron.setSpotOracle`)
    return oracle
  }

  // Integrate a number of assets into a Yield v2 environment
  public static async setup(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: Ladle,
    assets: Array<[string, string]>,              // [ [assetId, assetAddress], ... ]
    baseIds: Array<string>,
    rateOracle: IOracle,
    rateSourceAddresses: Map<string, string>,             // baseId => sourceAddress
    spotOracle: IOracle,
    spotSourceAddresses: Map<string, Map<string, string>> // baseId,quoteId => sourceAddress
  ) {
    const joins: Map<string, Join> = new Map()

    for (let [assetId, assetAddress] of assets) {
      // ==== Add the asset to the cauldron
      await this.addAsset(cauldron, assetId, assetAddress)

      // ==== Deploy Join
      const join = await this.addJoin(owner, ladle, assetId, assetAddress) as Join
      joins.set(assetId, join)
    }

    for (let baseId of baseIds) {
      // ==== Add the rate oracle for each base
      await this.addRateOracle(cauldron, rateOracle, baseId, rateSourceAddresses.get(baseId) as string)

      for (let [assetId, ] of assets) {
        if (baseId === assetId) continue;
        // ==== Set debt limits ====
        await cauldron.setMaxDebt(baseId, assetId, WAD.mul(1000000)); console.log(`cauldron.setMaxDebt(${baseId}, ${assetId})`)
        
        // ==== Add the spot oracle for each base/quote pair
        await this.addSpotOracle(cauldron, spotOracle, baseId, assetId, (spotSourceAddresses.get(baseId) as Map<string, string>).get(assetId) as string)
      }
    }

    return new Assets(owner, joins)
  }
}
