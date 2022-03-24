import { ethers } from 'hardhat'
import { Cauldron, Ladle, Router, Witch } from '../typechain'
import { ZERO_ADDRESS } from './constants'
import { AssetEntityProxy, NetworksEntityProxy, ProtocolObjectProxy, SeriesEntityProxy } from './proxyCode'
import { assets, series } from './starterData'
import { AssetEntity, SeriesEntity } from './types'

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
    // Load the file
    // If no file present
    this.protOb = proto
    this.networks = proto.networks
    this.cauldron = null
    this.ladle = null
    this.router = null
    this.witch = null
    this.developer = null
    this.activeNetwork = null
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
  }

  public async readAssets(assetIds: AssetEntity[]) {
    if (this.activeNetwork!.config!.cauldron!.asset!.length == 0) {
      for (let index = 0; index < assetIds.length; index++) {
        const element = assetIds[index]
        // console.log(await this.cauldron!.assets(element.assetId))
        let asset = {} as AssetEntityProxy
        asset.assetId = element.assetId
        asset.address = await this.cauldron!.assets(element.assetId)
        this.activeNetwork!.config!.cauldron!.asset!.push(asset as never)
      }
    } else {
      for (let index = 0; index < assetIds.length; index++) {
        const element = assetIds[index]
        if (element.address == undefined || element.address == '') {
          console.log(await this.cauldron!.assets(element.assetId))
        } else {
          // Compare & update
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
        let indexOf = this.activeNetwork!.config!.cauldron!.series!.findIndex(x=>x.seriesId==element.seriesId)
        if(indexOf==-1){
          // Series not found
          // Get data & update
          let seriesData = await this.cauldron!.series(element.seriesId)
        }else{
          // Series found
          // Check if data is correct
          // If data is not correct then update
        }
      }
    }
  }

  public addSeries(series: SeriesEntity[]) {
    for (let index = 0; index < series.length; index++) {
      const element = series[index]
      let seriesItem = {} as SeriesEntityProxy
      seriesItem.seriesId = element.seriesId
      seriesItem.fyToken = element.fyToken
      seriesItem.baseId = element.baseId
    }
  }

  public updateJson() {
    // Write the data to the file
  }
}
