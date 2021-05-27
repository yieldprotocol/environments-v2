import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { waffle } from 'hardhat'
import { WAD, ETH, DAI, USDC, WBTC } from '../shared/constants'
import { bytesToString, verify } from '../shared/helpers'

import ERC20MockArtifact from '../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'
import DaiMockArtifact from '../artifacts/contracts/mocks/DaiMock.sol/DaiMock.json'
import USDCMockArtifact from '../artifacts/contracts/mocks/USDCMock.sol/USDCMock.json'
import WBTCMockArtifact from '../artifacts/contracts/mocks/WBTCMock.sol/WBTCMock.json'
import WETH9MockArtifact from '../artifacts/contracts/mocks/WETH9Mock.sol/WETH9Mock.json'
import CTokenRateMockArtifact from '../artifacts/contracts/mocks/CTokenRateMock.sol/CTokenRateMock.json'
import CTokenChiMockArtifact from '../artifacts/contracts/mocks/CTokenChiMock.sol/CTokenChiMock.json'
import ChainlinkAggregatorV3MockArtifact from '../artifacts/contracts/mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'

import { ERC20Mock } from '../typechain/ERC20Mock'
import { WETH9Mock } from '../typechain/WETH9Mock'
import { ISourceMock } from '../typechain/ISourceMock'


const { deployContract } = waffle

export class Mocks {
  owner: SignerWithAddress
  assets: Map<string, ERC20Mock | WETH9Mock>
  rateSources: Map<string, ISourceMock>
  chiSources: Map<string, ISourceMock>
  spotSources: Map<string, ISourceMock>
  
  constructor(
    owner: SignerWithAddress,
    assets: Map<string, ERC20Mock | WETH9Mock>,
    rateSources: Map<string, ISourceMock>,
    chiSources: Map<string, ISourceMock>,
    spotSources: Map<string, ISourceMock>,
  ) {
    this.owner = owner
    this.assets = assets
    this.rateSources = rateSources
    this.chiSources = chiSources
    this.spotSources = spotSources
  }

  public static async deployAsset(owner: SignerWithAddress, assetId: string): Promise<ERC20Mock | WETH9Mock>{
    let asset: ERC20Mock | WETH9Mock;

    const symbol = bytesToString(assetId)

    if (assetId === DAI) {
      const args = [symbol, symbol]
      asset = (await deployContract(owner, DaiMockArtifact, args)) as unknown as ERC20Mock
      console.log(`[${symbol}, '${asset.address}'],`)
      verify(asset.address, args)
    } else if (assetId === USDC) {
      const args: any = []
      asset = (await deployContract(owner, USDCMockArtifact, args)) as unknown as ERC20Mock
      console.log(`[${symbol}, '${asset.address}'],`)
      verify(asset.address, args)
    } else if (assetId === ETH) {
      const args: any = []
      asset = (await deployContract(owner, WETH9MockArtifact, args)) as unknown as WETH9Mock
      console.log(`[${symbol}, '${asset.address}'],`)
      verify(asset.address, args)
    } else if (assetId === WBTC) {
      const args: any = []
      asset = (await deployContract(owner, WBTCMockArtifact, args)) as unknown as ERC20Mock
      verify(asset.address, args)
    } else {
      const args = [symbol, symbol]
      asset = (await deployContract(owner, ERC20MockArtifact, args)) as unknown as ERC20Mock
      console.log(`[${symbol}, '${asset.address}'],`)
      verify(asset.address, args)
    }

    // Fund the owner account (through minting because token is mocked)
    if (assetId != ETH) await asset.mint(await owner.getAddress(), WAD.mul(100000))

    return asset
  }

  public static async deployRateSource(owner: SignerWithAddress, base: string): Promise<ISourceMock> {
    const args: any = []
    const cTokenRate = (await deployContract(owner, CTokenRateMockArtifact, args)) as ISourceMock
    console.log(`[${base}, '${cTokenRate.address}'],`)
    verify(cTokenRate.address, args)
    await cTokenRate.set(WAD.mul(2))
    return cTokenRate
  }

  public static async deployChiSource(owner: SignerWithAddress, base: string) {
    const args: any = []
    const cTokenChi = (await deployContract(owner, CTokenChiMockArtifact, args)) as ISourceMock
    console.log(`[${base}, '${cTokenChi.address}'],`)
    verify(cTokenChi.address, args)
    await cTokenChi.set(WAD)
    return cTokenChi
  }

  public static async deploySpotSource(owner: SignerWithAddress, base: string, quote: string) {
    const args: any = [18]
    const aggregator = (await deployContract(owner, ChainlinkAggregatorV3MockArtifact, args)) as ISourceMock
    console.log(`[${quote}, '${aggregator.address}'],`)
    verify(aggregator.address, args)
    await aggregator.set(WAD.mul(2))
    return aggregator
  }

  public static async setup(
    owner: SignerWithAddress,
    assetIds: Array<string>,
    baseIds: Array<string>,
    ilkIds: Array<[string, string]>,
  ) {
    const assets: Map<string, ERC20Mock | WETH9Mock> = new Map()
    const rateSources: Map<string, ISourceMock> = new Map()
    const chiSources: Map<string, ISourceMock> = new Map()
    const spotSources: Map<string, ISourceMock> = new Map()

    console.log(`Deploying tokens:`)
    for (let assetId of assetIds) {
      const asset = await this.deployAsset(owner, assetId)
      assets.set(assetId, asset)
    }

    // console.log(`Deploying rate sources:`)
    // for (let baseId of baseIds) {
    //   const base = bytesToString(baseId)
    //   rateSources.set(baseId, await this.deployRateSource(owner, base))
    // }

    // console.log(`Deploying chi sources:`)
    // for (let baseId of baseIds) {
    //   const base = bytesToString(baseId)
    //   chiSources.set(baseId, await this.deployChiSource(owner, base))
    // }

    console.log(`Deploying spot sources:`)
    for (let [baseId, ilkId] of ilkIds) {
      const base = bytesToString(baseId);
      const quote = bytesToString(ilkId);
      spotSources.set(`${baseId},${ilkId}`, await this.deploySpotSource(owner, base, quote))
    }

    return new Mocks(owner, assets, rateSources, chiSources, spotSources)
  }
}
