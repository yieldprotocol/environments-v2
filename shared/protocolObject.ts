import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import { Cauldron, EmergencyBrake, Ladle, Router, Timelock, Witch } from '../typechain'
import { ZERO_ADDRESS } from './constants'
import { bytesToBytes32, getOriginalChainId, getOwnerOrImpersonate } from './helpers'
import {
  AssetEntityProxy,
  IlksEntityProxy,
  JoinsEntityProxy,
  LendingOracleEntityProxy,
  NetworksEntityProxy,
  PoolsEntityProxy,
  ProtocolObjectProxy,
  SeriesEntityProxy,
  SpotOraclesEntityProxy,
} from './proxyCode'
import { assets, networkNames, series } from './starterData'
import { AssetEntity, IlksEntity, JoinsEntity, PoolsEntity, SeriesEntity, SpotOraclesEntity } from './types'
import { readFileSync, writeFileSync } from 'fs'
import { plainToClass, serialize } from 'class-transformer'
import { SpotOracleStruct } from '../typechain/ICauldron'
const { developer, deployer } = require(process.env.CONF as string)
export class protocolObject {
  public protOb: ProtocolObjectProxy
  public networks: NetworksEntityProxy[]
  public cauldron: Cauldron | null
  public ladle: Ladle | null
  public router: Router | null
  public witch: Witch | null
  public timelock: Timelock | null
  public cloak: EmergencyBrake | null
  public dev: any
  public dep: string
  public activeNetwork: NetworksEntityProxy | null

  public multisig: any

  constructor(proto: ProtocolObjectProxy) {
    this.protOb = proto
    this.networks = proto.networks
    this.cauldron = null
    this.ladle = null
    this.router = null
    this.witch = null
    this.dev = null
    this.cloak = null
    this.timelock = null
    this.activeNetwork = null
    this.dep = ''
  }

  public static async CREATE(): Promise<protocolObject> {
    // TODO: Handle what happens when the file doesn't exists
    let protocol = JSON.parse(await readFileSync('./protocolObject/protocolObject2.json', 'utf8'))
    let protocolObjPrx = plainToClass(ProtocolObjectProxy, protocol)
    let protocolObj = new protocolObject(protocolObjPrx)
    // console.log('here')
    const chainId = await getOriginalChainId()
    // console.log(chainId)
    await protocolObj.loadProtocol(networkNames.get(chainId) as string)

    return protocolObj
  }

  private async loadProtocol(name: string) {
    let network: NetworksEntityProxy = this.networks.find((x) => x.name == name) as NetworksEntityProxy
    this.activeNetwork = network
    this.multisig = network.multisig
    this.dep = deployer
    this.dev = await getOwnerOrImpersonate(developer)

    this.cauldron = (await ethers.getContractAt(
      'Cauldron',
      network.protocol.cauldron[network.protocol.cauldron.length - 1].address,
      this.dev
    )) as Cauldron
    this.ladle = (await ethers.getContractAt(
      'Ladle',
      network.protocol.ladle[network.protocol.ladle.length - 1].address,
      this.dev
    )) as Ladle

    this.router = (await ethers.getContractAt(
      'Router',
      network.protocol.router[network.protocol.router.length - 1].address,
      this.dev
    )) as Router

    this.witch = (await ethers.getContractAt(
      'Witch',
      network.protocol.witch[network.protocol.witch.length - 1].address,
      this.dev
    )) as Witch

    this.timelock = (await ethers.getContractAt(
      'Timelock',
      network.protocol.timelock[network.protocol.timelock.length - 1].address,
      this.dev
    )) as Timelock

    this.cloak = (await ethers.getContractAt(
      'EmergencyBrake',
      network.protocol.cloak[network.protocol.cloak.length - 1].address,
      this.dev
    )) as EmergencyBrake
  }

  public async loadData() {
    await this.readAssets(assets)
    await this.readSeries(series)
    await this.readIlks(series, assets)
    await this.readJoins(assets)
    await this.readPools(series)
    await this.readLendingOracles(assets)
    await this.readSpotOracles(assets)
  }

  public saveObject() {
    let serialized = serialize(this.protOb)
    writeFileSync('./protocolObject/protocolObject2.json', serialized, 'utf8')
  }

  public async diffData() {
    await this.diffAssets()
    await this.diffSeries()
    await this.diffIlks()
    await this.diffJoins()
    await this.diffPools()
    await this.diffLendingOracles()
    await this.diffSpotOracles()
  }

  // Utility function
  public getJoin(assetId: string): string {
    let join = this.activeNetwork!.config!.ladle!.joins!.find((x) => x.assetId == assetId)
    if (join == undefined) return ZERO_ADDRESS
    return join!.address
  }

  // -----------------Core functions------------------------

  // ----- Asset -----
  public async readAssets(assetIds: AssetEntity[]) {
    if (this.activeNetwork!.config!.cauldron!.asset!.length == 0) {
      // No data is present in the protocol object so reading from scratch & adding it
      for (let index = 0; index < assetIds.length; index++) {
        const element = assetIds[index]
        // console.log(await this.cauldron!.assets(element.assetId))
        let onChainAddress = await this.cauldron!.assets(element.assetId)
        if (onChainAddress != ZERO_ADDRESS) {
          let asset = {} as AssetEntityProxy
          asset.assetId = element.assetId
          asset.address = onChainAddress
          this.activeNetwork!.config!.cauldron!.asset!.push(asset as never)
        }
      }
    } else {
      for (let index = 0; index < assetIds.length; index++) {
        const element = assetIds[index]
        let indexOf = this.activeNetwork!.config!.cauldron!.asset!.findIndex((x) => x.assetId == element.assetId)
        let onChainAddress = await this.cauldron!.assets(element.assetId)
        if (onChainAddress != ZERO_ADDRESS) {
          if (indexOf == -1) {
            // Asset not found
            let asset = {} as AssetEntityProxy
            asset.assetId = element.assetId
            asset.address = onChainAddress
            // Add the asset to the assets
            this.activeNetwork!.config!.cauldron!.asset!.push(asset as never)
          } else {
            // See if the data is good or not in the protocol object
            if (this.activeNetwork!.config!.cauldron!.asset![indexOf].address != onChainAddress) {
              this.activeNetwork!.config!.cauldron!.asset![indexOf].address = onChainAddress
              console.log('updated')
            }
          }
        }
      }

      // Remove any assets which is in our object but not on chain
      for (let index = 0; index < this.activeNetwork!.config!.cauldron!.asset!.length; index++) {
        const element = this.activeNetwork!.config!.cauldron!.asset![index]
        let onChainAddress = await this.cauldron!.assets(element.assetId)
        if (onChainAddress == ZERO_ADDRESS) {
          this.activeNetwork!.config!.cauldron!.asset!.splice(index, 1)
        }
      }
    }
  }

  public async diffAssets() {
    let misMatchAssets = []
    for (let index = 0; index < this.activeNetwork!.config!.cauldron!.asset!.length; index++) {
      const element = this.activeNetwork!.config!.cauldron!.asset![index]
      let onChainAddress = await this.cauldron!.assets(element.assetId)
      if (onChainAddress != element.address) {
        // console.log(`${element.assetId} `)
        misMatchAssets.push({ asset: element.assetId, onChainAddress: onChainAddress, objAddress: element.address })
      }
    }
    if (misMatchAssets.length > 0) console.table(misMatchAssets)
    else console.log('All assets are matching')
  }

  public addAssets(assets: AssetEntity[]) {
    for (let index = 0; index < assets.length; index++) {
      const element = assets[index]
      let assetItem = {} as AssetEntityProxy
      assetItem.assetId = element.assetId
      assetItem.address = element.address
      assetItem.deploymentTime = element.deploymentTime
      this.activeNetwork!.config!.cauldron!.asset!.push(assetItem as never)
    }
  }

  public async getAddableAssets(assets: AssetEntity[]): Promise<AssetEntity[]> {
    let addableAssets: AssetEntityProxy[] = []
    var address: String
    for (const asset of assets) {
      // Get the address for the asset in cauldron
      address = await this.cauldron!.assets!(asset.assetId)

      // If asset address is present no need to add
      if (address == asset.address) {
        console.log(`Asset ${asset.assetId} is already present in the cauldron`)
      } else {
        // If address is zero it is absent in the cauldron
        if (address == ZERO_ADDRESS) {
          // TODO: Add on-chain check to see if right address?
          addableAssets.push(asset)
          console.log(`Asset ${asset.assetId} can be added to cauldron`)
        } else {
          console.log(`Asset ${asset.assetId} present with a different address ${address}`)
        }
      }
    }
    if (addableAssets.length < 1) {
      console.table(assets)
      throw 'No addable assets!'
    }
    return addableAssets
  }

  // ----- Series -----
  private async readSeries(series: SeriesEntity[]) {
    if (this.activeNetwork!.config!.cauldron!.series!.length == 0) {
      // No data is populated
      for (let index = 0; index < series.length; index++) {
        const element = series[index]
        let seriesItem = {} as SeriesEntityProxy
        seriesItem.seriesId = element.seriesId
        let seriesData = await this.cauldron!.series(element.seriesId)
        if (seriesData.fyToken != ZERO_ADDRESS && seriesData.maturity != 0) {
          seriesItem.baseId = seriesData.baseId
          seriesItem.fyToken = seriesData.fyToken
          seriesItem.maturity = seriesData.maturity

          this.activeNetwork!.config!.cauldron!.series!.push(seriesItem as never)
        }
      }
    } else {
      for (let index = 0; index < series.length; index++) {
        const element = series[index]
        let indexOf = this.activeNetwork!.config!.cauldron!.series!.findIndex((x) => x.seriesId == element.seriesId)
        let onChainSeriesData = await this.cauldron!.series(element.seriesId)
        if (indexOf == -1) {
          // Series not found
          // Get data & update
          let seriesItem = {} as SeriesEntityProxy
          seriesItem.seriesId = element.seriesId

          if (onChainSeriesData.fyToken != ZERO_ADDRESS && onChainSeriesData.maturity != 0) {
            seriesItem.baseId = onChainSeriesData.baseId
            seriesItem.fyToken = onChainSeriesData.fyToken
            seriesItem.maturity = onChainSeriesData.maturity

            this.activeNetwork!.config!.cauldron!.series!.push(seriesItem as never)
          }
        } else {
          // Series found
          // If data is not correct then update
          if (this.activeNetwork!.config!.cauldron!.series![indexOf].baseId != onChainSeriesData.baseId) {
            this.activeNetwork!.config!.cauldron!.series![indexOf].baseId = onChainSeriesData.baseId
          }
          if (this.activeNetwork!.config!.cauldron!.series![indexOf].fyToken != onChainSeriesData.fyToken) {
            this.activeNetwork!.config!.cauldron!.series![indexOf].fyToken = onChainSeriesData.fyToken
          }
          if (this.activeNetwork!.config!.cauldron!.series![indexOf].maturity != onChainSeriesData.maturity) {
            this.activeNetwork!.config!.cauldron!.series![indexOf].maturity = onChainSeriesData.maturity
          }
        }
      }
    }
  }
  private async diffSeries() {
    let misMatch = []
    for (let index = 0; index < this.activeNetwork!.config!.cauldron!.series!.length; index++) {
      const element = this.activeNetwork!.config!.cauldron!.series![index]
      let onChainSeriesData = await this.cauldron!.series(element.seriesId)
      if (
        element.baseId != onChainSeriesData.baseId ||
        element.fyToken != onChainSeriesData.fyToken ||
        element.maturity != onChainSeriesData.maturity
      ) {
        misMatch.push({
          series: element.seriesId,
          baseId:
            element.baseId == onChainSeriesData.baseId
              ? element.baseId
              : { obj: element.baseId, onChain: onChainSeriesData.baseId },
          fyToken:
            element.fyToken == onChainSeriesData.fyToken
              ? element.fyToken
              : { obj: element.fyToken, onChain: onChainSeriesData.fyToken },
          maturity:
            element.maturity == onChainSeriesData.maturity
              ? element.maturity
              : { obj: element.maturity, onChain: onChainSeriesData.maturity },
        })
      }
    }
    if (misMatch.length > 0) console.table(misMatch)
    else console.log('All series are matching')
  }
  public addSeries(series: SeriesEntity[]) {
    for (let index = 0; index < series.length; index++) {
      const element = series[index]
      let seriesItem = {} as SeriesEntityProxy
      seriesItem.seriesId = element.seriesId
      seriesItem.baseId = element.baseId
      seriesItem.fyToken = element.fyToken
      seriesItem.maturity = parseInt(element.maturity)

      this.activeNetwork!.config!.cauldron!.series!.push(seriesItem as never)
    }
  }

  // ----- Ilks -----
  private async readIlks(series: SeriesEntity[], assetIds: AssetEntity[]) {
    if (this.activeNetwork!.config!.cauldron!.ilks!.length == 0) {
      for (let seriesIndex = 0; seriesIndex < series.length; seriesIndex++) {
        for (let baseIndex = 0; baseIndex < assetIds.length; baseIndex++) {
          let bIlk = await this.cauldron!.ilks(series[seriesIndex].seriesId, assetIds[baseIndex].assetId)

          if (bIlk) {
            // Add ilk data
            let ilk = {} as IlksEntityProxy

            ilk.seriesId = series[seriesIndex].seriesId
            ilk.ilkId = assetIds[baseIndex].assetId
            this.activeNetwork!.config!.cauldron!.ilks!.push(ilk as never)
          }
        }
      }
    } else {
      for (let seriesIndex = 0; seriesIndex < series.length; seriesIndex++) {
        for (let baseIndex = 0; baseIndex < assetIds.length; baseIndex++) {
          let bIlk = await this.cauldron!.ilks(series[seriesIndex].seriesId, assetIds[baseIndex].assetId)
          let indexOf = this.activeNetwork!.config!.cauldron!.ilks!.findIndex(
            (x) => x.seriesId == series[seriesIndex].seriesId && x.ilkId == assetIds[baseIndex].assetId
          )
          if (bIlk && indexOf == -1) {
            // Add ilk data as ilk is present on chain & not in protocol object
            let ilk = {} as IlksEntityProxy

            ilk.seriesId = series[seriesIndex].seriesId
            ilk.ilkId = assetIds[baseIndex].assetId
            this.activeNetwork!.config!.cauldron!.ilks!.push(ilk as never)
          }
          if (!bIlk && indexOf != -1) {
            // Not ilk but ilk present in protcol object so remove
            this.activeNetwork!.config!.cauldron!.ilks!.splice(indexOf, 1)
          }
        }
      }

      // Check if we don't have any data which is not valid
      for (let index = 0; index < this.activeNetwork!.config!.cauldron!.ilks!.length; index++) {
        const element = this.activeNetwork!.config!.cauldron!.ilks![index]
        let bIlk = await this.cauldron!.ilks(element.seriesId, element.ilkId)
        if (!bIlk) {
          this.activeNetwork!.config!.cauldron!.ilks!.splice(index, 1)
        }
      }
    }
  }
  private async diffIlks() {
    let misMatch = []
    for (let index = 0; index < this.activeNetwork!.config!.cauldron!.ilks!.length; index++) {
      const element = this.activeNetwork!.config!.cauldron!.ilks![index]
      let bIlkOnChain = await this.cauldron!.ilks(element.seriesId, element.ilkId)
      if (!bIlkOnChain) {
        misMatch.push({ series: element.seriesId, ilk: element.ilkId })
      }
    }
    if (misMatch.length > 0) {
      console.log('Following are present as ilk in object but not on chain')
      console.table(misMatch)
    } else {
      console.log('All ilks are matching')
    }
  }
  public addIlks(ilks: IlksEntity[]) {
    for (let index = 0; index < ilks.length; index++) {
      const element = ilks[index]

      let ilk = {} as IlksEntityProxy
      ilk.seriesId = element.seriesId
      ilk.ilkId = element.ilkId
      this.activeNetwork!.config!.cauldron!.ilks!.push(ilk as never)
    }
  }

  // ----- Lending Oracles -----
  public async readLendingOracles(assetIds: AssetEntity[]) {
    if (this.activeNetwork!.config!.cauldron!.lendingOracle!.length == 0) {
      // No data is present in the protocol object so reading from scratch & adding it
      for (let index = 0; index < assetIds.length; index++) {
        // console.log(await this.cauldron!.assets(element.assetId))
        let onChainAddress = await this.cauldron!.lendingOracles(assetIds[index].assetId)
        if (onChainAddress != ZERO_ADDRESS) {
          let asset = {} as LendingOracleEntityProxy
          asset.id = assetIds[index].assetId
          asset.address = onChainAddress
          this.activeNetwork!.config!.cauldron!.lendingOracle!.push(asset as never)
        }
      }
    } else {
      for (let index = 0; index < assetIds.length; index++) {
        const element = assetIds[index]
        let indexOf = this.activeNetwork!.config!.cauldron!.lendingOracle!.findIndex((x) => x.id == element.assetId)
        let onChainAddress = await this.cauldron!.lendingOracles(element.assetId)
        if (onChainAddress != ZERO_ADDRESS) {
          if (indexOf == -1) {
            // Asset not found
            let asset = {} as LendingOracleEntityProxy
            asset.id = element.assetId
            asset.address = onChainAddress
            // Add the asset to the assets
            this.activeNetwork!.config!.cauldron!.lendingOracle!.push(asset as never)
          } else {
            // See if the data is good or not in the protocol object
            if (this.activeNetwork!.config!.cauldron!.lendingOracle![indexOf].address != onChainAddress) {
              this.activeNetwork!.config!.cauldron!.lendingOracle![indexOf].address = onChainAddress
              console.log('updated')
            }
          }
        }
      }

      // Remove any assets which is in our object but not on chain
      for (let index = 0; index < this.activeNetwork!.config!.cauldron!.lendingOracle!.length; index++) {
        const element = this.activeNetwork!.config!.cauldron!.lendingOracle![index]
        let onChainAddress = await this.cauldron!.lendingOracles(element.id)
        if (onChainAddress == ZERO_ADDRESS) {
          this.activeNetwork!.config!.cauldron!.lendingOracle!.splice(index, 1)
        }
      }
    }
  }

  private async diffLendingOracles() {
    let misMatchLendingOracles = []
    for (let index = 0; index < this.activeNetwork!.config!.cauldron!.lendingOracle!.length; index++) {
      const element = this.activeNetwork!.config!.cauldron!.lendingOracle![index]
      let onChainAddress = await this.cauldron!.lendingOracles(element.id)
      if (onChainAddress != element.address) {
        // console.log(`${element.id} `)
        misMatchLendingOracles.push({ asset: element.id, onChainAddress: onChainAddress, objAddress: element.address })
      }
    }
    if (misMatchLendingOracles.length > 0) console.table(misMatchLendingOracles)
    else console.log('All lendingOracles are matching')
  }

  public addLendingOracles(assets: AssetEntity[]) {
    for (let index = 0; index < assets.length; index++) {
      const element = assets[index]
      let assetItem = {} as AssetEntityProxy
      assetItem.assetId = element.assetId
      assetItem.address = element.address
      assetItem.deploymentTime = element.deploymentTime
      this.activeNetwork!.config!.cauldron!.lendingOracle!.push(assetItem as never)
    }
  }

  // ----- Spot Oracles -----
  private async readSpotOracles(assetIds: AssetEntity[]) {
    if (this.activeNetwork!.config!.cauldron!.spotOracles!.length == 0) {
      for (let seriesIndex = 0; seriesIndex < assetIds.length; seriesIndex++) {
        for (let baseIndex = 0; baseIndex < assetIds.length; baseIndex++) {
          if (seriesIndex == baseIndex) continue
          let spotOracleData = (await this.cauldron!.spotOracles(
            assetIds[seriesIndex].assetId,
            assetIds[baseIndex].assetId
          )) as SpotOracleStruct

          if (spotOracleData.oracle != ZERO_ADDRESS) {
            let spotOracle = {} as SpotOraclesEntityProxy
            spotOracle.asset1 = assetIds[seriesIndex].assetId
            spotOracle.asset2 = assetIds[baseIndex].assetId
            spotOracle.oracleAddress = spotOracleData.oracle
            // spotOracle.ratio = spotOracleData.ratio//BigNumberish issue
            this.activeNetwork!.config!.cauldron!.spotOracles!.push(spotOracle as never)
          }
        }
      }
    } else {
      for (let seriesIndex = 0; seriesIndex < assetIds.length; seriesIndex++) {
        for (let baseIndex = 0; baseIndex < assetIds.length; baseIndex++) {
          if (seriesIndex == baseIndex) continue
          let onChainSpotOracleData = (await this.cauldron!.spotOracles(
            assetIds[seriesIndex].assetId,
            assetIds[baseIndex].assetId
          )) as SpotOracleStruct

          let indexOf = this.activeNetwork!.config!.cauldron!.spotOracles!.findIndex(
            (x) => x.asset1 == assetIds[seriesIndex].assetId && x.asset2 == assetIds[baseIndex].assetId
          )
          if (onChainSpotOracleData.oracle != ZERO_ADDRESS && indexOf == -1) {
            // Add data as it is present on chain & not in protocol object
            let spotOracle = {} as SpotOraclesEntityProxy
            spotOracle.asset1 = assetIds[seriesIndex].assetId
            spotOracle.asset2 = assetIds[baseIndex].assetId
            spotOracle.oracleAddress = onChainSpotOracleData.oracle
            // spotOracle.ratio = spotOracleData.ratio//BigNumberish issue
            this.activeNetwork!.config!.cauldron!.spotOracles!.push(spotOracle as never)
          }
          if (onChainSpotOracleData.oracle == ZERO_ADDRESS && indexOf != -1) {
            // Not spot oracle but present in protcol object so remove
            this.activeNetwork!.config!.cauldron!.spotOracles!.splice(indexOf, 1)
          }
        }
      }

      // Check if we don't have any data which is not valid
      for (let index = 0; index < this.activeNetwork!.config!.cauldron!.spotOracles!.length; index++) {
        const element = this.activeNetwork!.config!.cauldron!.spotOracles![index]
        let onChainSpotOracleData = (await this.cauldron!.spotOracles(
          element.asset1,
          element.asset2
        )) as SpotOracleStruct
        if (onChainSpotOracleData.oracle == ZERO_ADDRESS) {
          this.activeNetwork!.config!.cauldron!.ilks!.splice(index, 1)
        }
      }
    }
  }
  private async diffSpotOracles() {
    let misMatch = []
    for (let index = 0; index < this.activeNetwork!.config!.cauldron!.spotOracles!.length; index++) {
      const element = this.activeNetwork!.config!.cauldron!.spotOracles![index]
      let onChainSpotOracleData = (await this.cauldron!.spotOracles(element.asset1, element.asset2)) as SpotOracleStruct
      if (onChainSpotOracleData.oracle != element.oracleAddress) {
        misMatch.push({
          asset1: element.asset1,
          asset2: element.asset2,
          objAddress: element.oracleAddress,
          onChainAddress: onChainSpotOracleData.oracle,
        })
      }
    }
    if (misMatch.length > 0) {
      console.log('Following are present as spot oracles in object but not on chain')
      console.table(misMatch)
    } else {
      console.log('All spotOracles are matching')
    }
  }

  public addSpotOracles(spotOracles: SpotOraclesEntity[]) {
    for (let index = 0; index < spotOracles.length; index++) {
      const element = spotOracles[index]

      let spotOracle = {} as SpotOraclesEntityProxy
      spotOracle.asset1 = element.asset1
      spotOracle.asset2 = element.asset2
      spotOracle.oracleAddress = element.oracleAddress
      // spotOracle.ratio = spotOracleData.ratio//BigNumberish issue
      this.activeNetwork!.config!.cauldron!.spotOracles!.push(spotOracle as never)
    }
  }

  // ----- Joins -----
  private async readJoins(assetIds: AssetEntity[]) {
    if (this.activeNetwork!.config!.ladle!.joins!.length == 0) {
      // No data is present in the protocol object so reading from scratch & adding it
      for (let index = 0; index < assetIds.length; index++) {
        const element = assetIds[index]
        // console.log(await this.cauldron!.assets(element.assetId))
        let onChainAddress = await this.ladle!.joins(element.assetId)
        if (onChainAddress != ZERO_ADDRESS) {
          let asset = {} as JoinsEntityProxy
          asset.assetId = element.assetId
          asset.address = await this.ladle!.joins(element.assetId)
          this.activeNetwork!.config!.ladle!.joins!.push(asset as never)
        }
      }
    } else {
      for (let index = 0; index < assetIds.length; index++) {
        const element = assetIds[index]
        let indexOf = this.activeNetwork!.config!.ladle!.joins!.findIndex((x) => x.assetId == element.assetId)
        let onChainAddress = await this.ladle!.joins(element.assetId)
        if (onChainAddress != ZERO_ADDRESS) {
          if (indexOf == -1) {
            // Asset not found
            let asset = {} as JoinsEntityProxy
            asset.assetId = element.assetId
            asset.address = onChainAddress
            // Add the asset to the assets
            this.activeNetwork!.config!.ladle!.joins!.push(asset as never)
          } else {
            // See if the data is good or not in the protocol object
            if (this.activeNetwork!.config!.ladle!.joins![indexOf].address != onChainAddress) {
              this.activeNetwork!.config!.ladle!.joins![indexOf].address = onChainAddress
              console.log('updated')
            }
          }
        }
      }

      // Remove any joins which is in our object but not on chain
      for (let index = 0; index < this.activeNetwork!.config!.ladle!.joins!.length; index++) {
        const element = this.activeNetwork!.config!.ladle!.joins![index]
        let onChainAddress = await this.ladle!.joins(element.assetId)
        if (onChainAddress == ZERO_ADDRESS) {
          this.activeNetwork!.config!.ladle!.joins!.splice(index, 1)
        }
      }
    }
  }
  private async diffJoins() {
    let misMatch = []
    for (let index = 0; index < this.activeNetwork!.config!.ladle!.joins!.length; index++) {
      const element = this.activeNetwork!.config!.ladle!.joins![index]
      let onChainAddress = await this.ladle!.joins(element.assetId)
      if (onChainAddress != element.address) {
        misMatch.push({ asset: element.assetId, joinAddressOnObj: element.address, joinAddressOnChain: onChainAddress })
      }
    }
    if (misMatch.length > 0) console.table(misMatch)
    else console.log('All joins are matching')
  }
  public addJoins(joins: JoinsEntity[]) {
    for (let index = 0; index < joins.length; index++) {
      const element = joins[index]

      let asset = {} as JoinsEntityProxy
      asset.assetId = element.assetId
      asset.address = element.address
      this.activeNetwork!.config!.ladle!.joins!.push(asset as never)
    }
  }

  // ----- Pools -----
  private async readPools(seriesIds: SeriesEntity[]) {
    if (this.activeNetwork!.config!.ladle!.pools!.length == 0) {
      // No data is present in the protocol object so reading from scratch & adding it
      for (let index = 0; index < seriesIds.length; index++) {
        const element = seriesIds[index]
        // console.log(await this.cauldron!.assets(element.assetId))
        let onChainAddress = await this.ladle!.pools(element.seriesId)
        if (onChainAddress != ZERO_ADDRESS) {
          let asset = {} as PoolsEntityProxy
          asset.seriesId = element.seriesId
          asset.address = await this.ladle!.pools(element.seriesId)
          this.activeNetwork!.config!.ladle!.pools!.push(asset as never)
        }
      }
    } else {
      for (let index = 0; index < seriesIds.length; index++) {
        const element = seriesIds[index]
        let indexOf = this.activeNetwork!.config!.ladle!.pools!.findIndex((x) => x.seriesId == element.seriesId)
        let onChainAddress = await this.ladle!.pools(element.seriesId)
        if (onChainAddress != ZERO_ADDRESS) {
          if (indexOf == -1) {
            // Asset not found
            let asset = {} as PoolsEntityProxy
            asset.seriesId = element.seriesId
            asset.address = onChainAddress
            // Add the asset to the assets
            this.activeNetwork!.config!.ladle!.pools!.push(asset as never)
          } else {
            // See if the data is good or not in the protocol object
            if (this.activeNetwork!.config!.ladle!.pools![indexOf].address != onChainAddress) {
              this.activeNetwork!.config!.ladle!.pools![indexOf].address = onChainAddress
              console.log('updated')
            }
          }
        }
      }

      // Remove any pools which is in our object but not on chain
      for (let index = 0; index < this.activeNetwork!.config!.ladle!.pools!.length; index++) {
        const element = this.activeNetwork!.config!.ladle!.pools![index]
        let onChainAddress = await this.ladle!.pools(element.seriesId)
        if (onChainAddress == ZERO_ADDRESS) {
          this.activeNetwork!.config!.ladle!.pools!.splice(index, 1)
        }
      }
    }
  }
  private async diffPools() {
    let misMatch = []
    for (let index = 0; index < this.activeNetwork!.config!.ladle!.pools!.length; index++) {
      const element = this.activeNetwork!.config!.ladle!.pools![index]
      let onChainAddress = await this.ladle!.pools(element.seriesId)
      if (onChainAddress != element.address) {
        misMatch.push({
          seriesId: element.seriesId,
          joinAddressOnObj: element.address,
          joinAddressOnChain: onChainAddress,
        })
      }
    }
    if (misMatch.length > 0) console.table(misMatch)
    else console.log('All pools are matching')
  }
  public addPools(pools: PoolsEntity[]) {
    for (let index = 0; index < pools.length; index++) {
      const element = pools[index]

      let asset = {} as PoolsEntityProxy
      asset.seriesId = element.seriesId
      asset.address = element.address
      this.activeNetwork!.config!.ladle!.pools!.push(asset as never)
    }
  }
}
