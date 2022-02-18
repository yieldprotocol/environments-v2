import { ZERO_ADDRESS } from '../../../../shared/constants'

import { getContract, getOwnerOrImpersonate } from '../../../../shared/helpers'
import { Cauldron, ChainlinkUSDMultiOracle, EmergencyBrake, Ladle, Timelock, Witch } from '../../../../typechain'

export type Proposal = Array<{ target: string; data: string }>

/**
 * Harnes class that loads Yield environment based on json addresses
 *
 * A type-safe collection of contracts and address mappings
 */
export class Harness {
  constructor(
    readonly governance: Map<string, string>,
    readonly protocol: Map<string, string>,
    readonly pools: Map<string, string>,
    readonly ROOT: string,
    readonly owner: any,
    readonly timelock: Timelock,
    readonly cloak: EmergencyBrake,
    // readonly accumulatorMultiOracle: AccumulatorMultiOracle,
    readonly chainlinkUSDMultiOracle: ChainlinkUSDMultiOracle,
    readonly cauldron: Cauldron,
    readonly ladle: Ladle,
    readonly witch: Witch
  ) {}

  static async create(): Promise<Harness> {
    const { governance, protocol, pools, developer } = require(process.env.BASE as string)
    const owner = await getOwnerOrImpersonate(developer)

    const timelock = await getContract<Timelock>(owner, 'Timelock', governance.get('timelock'))

    return new Harness(
      governance,
      protocol,
      pools,
      await timelock.ROOT(),
      owner,
      timelock,
      await getContract<EmergencyBrake>(owner, 'EmergencyBrake', governance.get('cloak')),
      //   await getContract<AccumulatorMultiOracle>(owner, 'AccumulatorMultiOracle', protocol.get('accumulatorOracle')),
      await getContract<ChainlinkUSDMultiOracle>(owner, 'ChainlinkUSDMultiOracle', protocol.get('chainlinkOracle')),
      await getContract<Cauldron>(owner, 'Cauldron', protocol.get('cauldron')),
      await getContract<Ladle>(owner, 'Ladle', protocol.get('ladle')),
      await getContract<Witch>(owner, 'Witch', protocol.get('witch'))
    )
  }

  async addAssetTest(assets: Array<[string, string]>): Promise<Array<[string, string]>> {
    var assetState: Array<[string, string]> = []
    var address: String
    for (let [assetId, assetAddress] of assets) {
      // Get the address for the asset in cauldron
      address = await this.cauldron.assets(assetId)

      // If asset address is present no need to add
      if (address == assetAddress) {
        console.log(`Asset ${assetId} is already present in the cauldron`)
      } else {
        // If address is zero it is absent in the cauldron
        if (address == ZERO_ADDRESS) {
          assetState.push([assetId, assetAddress])
          console.log(`Asset ${assetId} can be added to cauldron`)
        } else {
          console.log(`Asset ${assetId} present with a different address ${address}`)
        }
      }
    }
    return assetState
  }

  async checkAssets(assets: Array<[string, string]>): Promise<Array<[string, string]>> {
    var assetState: Array<[string, string]> = []
    var address: String
    for (let [assetId, assetAddress] of assets) {
      address = await this.cauldron.assets(assetId)
      if (address == assetAddress) {
        console.log(`Asset ${assetId} added successfully`)
      } else {
        if (address == ZERO_ADDRESS) {
          console.log(`Asset ${assetId} not added`)
        } else {
          console.log(`Asset ${assetId} present with a different address ${address}`)
        }
      }
    }
    return assetState
  }
}
