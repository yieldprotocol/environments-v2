import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import { Cauldron, Ladle, Router, Witch } from '../typechain'
import { ZERO_ADDRESS } from './constants'
import { bytesToBytes32 } from './helpers'
import {
  AssetEntityProxy,
  IlksEntityProxy,
  JoinsEntityProxy,
  NetworksEntityProxy,
  PoolsEntityProxy,
  ProtocolObjectProxy,
  SeriesEntityProxy,
} from './proxyCode'
import { assets, series } from './starterData'
import { AssetEntity, SeriesEntity } from './types'
import { readFileSync, writeFileSync } from 'fs'
import { plainToClass, serialize } from 'class-transformer'

export class protocolObject {
  public protOb: ProtocolObjectProxy
  public networks: NetworksEntityProxy[]
  public cauldron: Cauldron | null
  public ladle: Ladle | null
  public router: Router | null
  public witch: Witch | null
  public developer: any
  public activeNetwork: NetworksEntityProxy | null

  constructor(proto: ProtocolObjectProxy) {
    this.protOb = proto
    this.networks = proto.networks
    this.cauldron = null
    this.ladle = null
    this.router = null
    this.witch = null
    this.developer = null
    this.activeNetwork = null
  }

  public static async LOAD(): Promise<protocolObject> {
    let protocol = JSON.parse(await readFileSync('./protocolObject/protocolObject2.json', 'utf8'))
    let protocolObjPrx = plainToClass(ProtocolObjectProxy, protocol)
    let protocolObj = new protocolObject(protocolObjPrx)

    for (const network of protocolObj.networks) {
      // TODO: reliable method of detecting network
      if (hre.network.name == network.name) {
        await protocolObj.loadProtocol(hre.network.name)
        break
      }
    }
    return protocolObj
  }

  public async loadProtocol(name: string) {
    let network: NetworksEntityProxy = this.networks.find((x) => x.name == name) as NetworksEntityProxy
    this.activeNetwork = network
    this.cauldron = (await ethers.getContractAt(
      'Cauldron',
      network.protocol.cauldron[network.protocol.cauldron.length - 1].address
    )) as Cauldron

    this.ladle = (await ethers.getContractAt(
      'Ladle',
      network.protocol.ladle[network.protocol.ladle.length - 1].address
    )) as Ladle

    this.router = (await ethers.getContractAt(
      'Router',
      network.protocol.router[network.protocol.router.length - 1].address
    )) as Router

    this.witch = (await ethers.getContractAt(
      'Witch',
      network.protocol.witch[network.protocol.witch.length - 1].address
    )) as Witch
  }

  public async loadData() {
    await this.readAssets(assets)
    await this.readSeries(series)
    await this.readIlks(series, assets)
    await this.readJoins(assets)
    await this.readPools(series)
  }

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

  public async readSeries(series: SeriesEntity[]) {
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

  public async readIlks(series: SeriesEntity[], assetIds: AssetEntity[]) {
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

  public saveObject() {
    let serialized = serialize(this.protOb)
    writeFileSync('./protocolObject/protocolObject2.json', serialized, 'utf8')
  }

  public async readJoins(assetIds: AssetEntity[]) {
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

      // Remove any joinss which is in our object but not on chain
      for (let index = 0; index < this.activeNetwork!.config!.ladle!.joins!.length; index++) {
        const element = this.activeNetwork!.config!.ladle!.joins![index]
        let onChainAddress = await this.ladle!.joins(element.assetId)
        if (onChainAddress == ZERO_ADDRESS) {
          this.activeNetwork!.config!.ladle!.joins!.splice(index, 1)
        }
      }
    }
  }

  public async readPools(seriesIds: SeriesEntity[]) {
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

      // Remove any poolss which is in our object but not on chain
      for (let index = 0; index < this.activeNetwork!.config!.ladle!.pools!.length; index++) {
        const element = this.activeNetwork!.config!.ladle!.pools![index]
        let onChainAddress = await this.ladle!.pools(element.seriesId)
        if (onChainAddress == ZERO_ADDRESS) {
          this.activeNetwork!.config!.ladle!.pools!.splice(index, 1)
        }
      }
    }
  }
}
