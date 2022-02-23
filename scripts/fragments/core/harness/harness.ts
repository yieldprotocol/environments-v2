import { BigNumber } from 'ethers'
import { ZERO_ADDRESS } from '../../../../shared/constants'

import { getContract, getOwnerOrImpersonate } from '../../../../shared/helpers'
import {
  Cauldron,
  ChainlinkUSDMultiOracle,
  CompositeMultiOracle,
  EmergencyBrake,
  Ladle,
  Timelock,
  Witch,
} from '../../../../typechain'
const {
  deployer,
} = require(process.env.BASE as string)
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
    readonly deployer: any,
    readonly timelock: Timelock,
    readonly cloak: EmergencyBrake,
    readonly compositeOracle: CompositeMultiOracle,
    readonly chainlinkUSDMultiOracle: ChainlinkUSDMultiOracle,
    readonly cauldron: Cauldron,
    readonly ladle: Ladle,
    readonly witch: Witch
  ) {}

  async loadAssetData() {}

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
      deployer,
      timelock,
      await getContract<EmergencyBrake>(owner, 'EmergencyBrake', governance.get('cloak')),
      await getContract<CompositeMultiOracle>(owner, 'CompositeMultiOracle', protocol.get('compositeOracle')),
      await getContract<ChainlinkUSDMultiOracle>(owner, 'ChainlinkUSDMultiOracle', protocol.get('chainlinkOracle')),
      await getContract<Cauldron>(owner, 'Cauldron', protocol.get('cauldron')),
      await getContract<Ladle>(owner, 'Ladle', protocol.get('ladle')),
      await getContract<Witch>(owner, 'Witch', protocol.get('witch'))
    )
  }

  // Check if the asset was added into the cauldron
  async checkAssets(assets: Array<[string, string]>) {
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
  }

  async getAddableAssets(assets: Array<[string, string]>): Promise<Array<[string, string]>> {
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
          // TODO: Add on-chain check to see if right address?
          assetState.push([assetId, assetAddress])
          console.log(`Asset ${assetId} can be added to cauldron`)
        } else {
          console.log(`Asset ${assetId} present with a different address ${address}`)
        }
      }
    }
    return assetState
  }

  // Check if the ilks were added in series supplied
  async checkIfIlksAddedInSeries(ilks: Array<[string, string[]]>) {
    for (const [series, ilkList] of ilks) {
      for (const ilk of ilkList) {
        if (await this.cauldron.ilks(series, ilk)) {
          // If it is an ilk
          console.log(`Asset ${ilk} is added as an ilk in cauldron`)
        } else {
          // If not an ilk
          console.log(`Asset ${ilk} is not an ilk in cauldron`)
        }
      }
    }
  }

  // Check & return ilks which are not added to the respective series
  async getAddableIlksInSeries(ilks: Array<[string, string[]]>): Promise<Array<[string, string[]]>> {
    var validIlks: Array<[string, string[]]> = []

    for (const [series, ilkList] of ilks) {
      var toAddIlks: string[] = []

      for (const ilk of ilkList) {
        if (await this.cauldron.ilks(series, ilk)) {
          // If it is already an ilk
          console.log(`Asset ${ilk} is added as an ilk in cauldron`)
        } else {
          // If not an ilk
          console.log(`Asset ${ilk} can be added as an ilk in cauldron`)
          toAddIlks.push(ilk)
        }
      }
      if (toAddIlks.length > 0) {
        validIlks.push([series, toAddIlks])
      }
    }
    return validIlks
  }

  // Check if the debt config is same as what is passed
  async checkDebtConfig(debtLimits: Array<[string, string, number, number, number, number]>) {
    for (const [baseId, ilkId, , line, dust, dec] of debtLimits) {
      var debt = await this.cauldron.debt(baseId, ilkId)
      if (debt['max'].eq(BigNumber.from(line)) && debt['dec'] == dec && debt['min'] == dust) {
        console.log('The debt config is same as passed')
      } else {
        console.log(`The debt config for ${baseId} & ${ilkId} is set incorrectly`)
      }
    }
  }

  // Check and return the debt config which are different from what is on cauldron
  async getDebtConfig(
    debtLimits: Array<[string, string, number, number, number, number]>
  ): Promise<Array<[string, string, number, number, number, number]>> {
    var debtConfigs: Array<[string, string, number, number, number, number]> = []

    for (const [baseId, ilkId, ratio, line, dust, dec] of debtLimits) {
      var debt = await this.cauldron.debt(baseId, ilkId)

      if (debt['max'].eq(BigNumber.from(line)) && debt['dec'] == dec && debt['min'] == dust) {
        console.log('The debt config is same as passed')
      } else {
        debtConfigs.push([baseId, ilkId, ratio, line, dust, dec])
      }
    }
    return debtConfigs
  }

  // Check if the supplied fyToken config is present on the cauldron
  async checkFyTokenConfig(seriesToCheck: Array<[string, string, string, string, number, string, string]>) {
    for (const [seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol] of seriesToCheck) {
      var series = await this.cauldron.series(seriesId)
      if (series['fyToken'] != ZERO_ADDRESS && series['baseId'] == underlyingId && series['maturity'] == maturity) {
        console.log(`FYyToken for series ${series['baseId']} deployed at ${series['fyToken']}`)
      } else {
        console.log(`FYyToken for series ${series['baseId']} is not deployed`)
      }
    }
  }

  // Check & return the deployable fyToken configurations
  async getDeployableFyTokenConfig(seriesToCheck: Array<[string, string, string, string, number, string, string]>) {
    var deployableFyToken: Array<[string, string, string, string, number, string, string]> = []
    for (const [seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol] of seriesToCheck) {
      var series = await this.cauldron.series(seriesId)
      if (series['fyToken'] == ZERO_ADDRESS && series['baseId'] != underlyingId && series['maturity'] != maturity) {
        deployableFyToken.push([seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol])
      } else {
        console.log('Is already deployed')
      }
    }
    return deployableFyToken
  }

  // Check if the base are present in cauldron
  async checkIfBase(oracles: Array<[string, string]>) {
    for (const [assetId, join] of oracles) {
      if ((await this.cauldron.lendingOracles(assetId)) != ZERO_ADDRESS) {
        // Is a base asset
        console.log(`Asset ${assetId} is a base`)
      } else {
        console.log(`Asset ${assetId} is not a base`)
      }
    }
  }

  // Check & return the assets which could be made into base
  async getBaseableAssets(oracles: Array<[string, string]>): Promise<Array<[string, string]>> {
    var baseAbleAsset: Array<[string, string]> = []
    for (const [assetId, join] of oracles) {
      if ((await this.cauldron.lendingOracles(assetId)) == ZERO_ADDRESS) {
        // Oracle is not present
        baseAbleAsset.push([assetId, join])
      } else {
        console.log(`Asset ${assetId} is already a base`)
      }
    }
    return baseAbleAsset
  }
}
