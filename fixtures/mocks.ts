import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle, network } from 'hardhat'
import { WAD, CHI, RATE, ETH, DAI, USDC } from '../shared/constants'

import ERC20MockArtifact from '../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'
import DaiMockArtifact from '../artifacts/contracts/mocks/DaiMock.sol/DaiMock.json'
import USDCMockArtifact from '../artifacts/contracts/mocks/USDCMock.sol/USDCMock.json'
import WETH9MockArtifact from '../artifacts/contracts/mocks/WETH9Mock.sol/WETH9Mock.json'
import CTokenRateMockArtifact from '../artifacts/contracts/mocks/CTokenRateMock.sol/CTokenRateMock.json'
import CTokenChiMockArtifact from '../artifacts/contracts/mocks/CTokenChiMock.sol/CTokenChiMock.json'
import ChainlinkAggregatorV3MockArtifact from '../artifacts/contracts/mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'

import { ERC20Mock } from '../typechain/ERC20Mock'
import { WETH9Mock } from '../typechain/WETH9Mock'
import { SourceMock } from '../typechain/SourceMock'


const { deployContract } = waffle

export class Mocks {
  owner: SignerWithAddress
  assets: Map<string, ERC20Mock | WETH9Mock>
  sources: Map<string, Map<string, SourceMock>>
  
  constructor(
    owner: SignerWithAddress,
    assets: Map<string, ERC20Mock | WETH9Mock>,
    sources: Map<string, Map<string, SourceMock>>,
  ) {
    this.owner = owner
    this.assets = assets
    this.sources = sources
  }

  public static bytesToString(bytes: string): string {
    return ethers.utils.parseBytes32String(bytes + '0'.repeat(66 - bytes.length))
  }

  public static async deployAsset(owner: SignerWithAddress, assetId: string): Promise<ERC20Mock | WETH9Mock>{
    let asset: ERC20Mock | WETH9Mock;

    const symbol = Mocks.bytesToString(assetId)

    if (assetId === DAI) { 
      asset = (await deployContract(owner, DaiMockArtifact, [symbol, symbol])) as unknown as ERC20Mock
    } else if (assetId === USDC) {
      asset = (await deployContract(owner, USDCMockArtifact, [])) as unknown as ERC20Mock
    } else if (assetId === ETH) {
      asset = (await deployContract(owner, WETH9MockArtifact, [])) as unknown as WETH9Mock
    } else {
      asset = (await deployContract(owner, ERC20MockArtifact, [symbol, symbol])) as unknown as ERC20Mock
    }
    console.log(`Deployed ${symbol} at ${asset.address}`)

    // Fund the owner account ( through minting because token is mocked)
    if (assetId != ETH) await asset.mint(await owner.getAddress(), WAD.mul(100000)); console.log('asset.mint(owner)')

    return asset
  }

  public static async deployRateSource(owner: SignerWithAddress, base: string): Promise<SourceMock> {
    const cTokenRate = (await deployContract(owner, CTokenRateMockArtifact, [])) as SourceMock
    console.log(`Deployed rate source for ${base} at ${cTokenRate.address}`)
    await cTokenRate.set(WAD.mul(2)); console.log(`cTokenRate.set`)
    return cTokenRate
  }

  public static async deployChiSource(owner: SignerWithAddress, base: string) {
    const cTokenChi = (await deployContract(owner, CTokenChiMockArtifact, [])) as SourceMock
    console.log(`Deployed chi source for ${base} at ${cTokenChi.address}`)
    await cTokenChi.set(WAD); console.log(`cTokenChi.set`)
    return cTokenChi
  }

  public static async deploySpotSource(owner: SignerWithAddress, base: string, quote: string) {
    const aggregator = (await deployContract(owner, ChainlinkAggregatorV3MockArtifact, [])) as SourceMock
    console.log(`Deployed spot source for ${base}/${quote} at ${aggregator.address}`)
    await aggregator.set(WAD.mul(2)); console.log(`aggregator.set`)
    return aggregator
  }

  public static async setup(
    owner: SignerWithAddress,
    assetIds: Array<string>,
    baseIds: Array<string>,
  ) {
    const assets: Map<string, ERC20Mock | WETH9Mock> = new Map()
    const sources: Map<string, Map<string, SourceMock>> = new Map()

    for (let assetId of assetIds) {
      const asset = await this.deployAsset(owner, assetId)
      assets.set(assetId, asset)
    }

    for (let baseId of baseIds) {
      if (!assetIds.includes(baseId)) console.error('baseId not included in assetIds')
      const base = Mocks.bytesToString(baseId)

      // For each base, we add mock chi and rate oracle sources
      const baseSources = new Map()
      baseSources.set(RATE, await this.deployRateSource(owner, base))
      baseSources.set(CHI, await this.deployChiSource(owner, base))

      for (let assetId of assetIds) {
        if (assetId === baseId) continue;
        const quote = Mocks.bytesToString(assetId)

        // For each base and asset pair, we add a mock spot oracle source
        baseSources.set(assetId, await this.deploySpotSource(owner, base, quote))
      }
      sources.set(baseId, baseSources)
    }

    return new Mocks(owner, assets, sources)
  }
}
