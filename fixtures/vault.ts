import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle, network } from 'hardhat'

import { id } from '@yield-protocol/utils-v2'
import { WAD, ETH, CHI, RATE } from '../shared/constants'
import { LadleWrapper } from '../shared/ladleWrapper'

import { transferFromFunder } from '../shared/helpers'

import ERC20MockArtifact from '../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'
import DaiMockArtifact from '../artifacts/contracts/mocks/DaiMock.sol/DaiMock.json'
import WETH9MockArtifact from '../artifacts/contracts/mocks/WETH9Mock.sol/WETH9Mock.json'

import ChainlinkMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/ChainlinkMultiOracle.sol/ChainlinkMultiOracle.json'
import CompoundMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/CompoundMultiOracle.sol/CompoundMultiOracle.json'
import ChainlinkAggregatorV3MockArtifact from '../artifacts/contracts/mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'
import CTokenRateMockArtifact from '../artifacts/contracts/mocks/CTokenRateMock.sol/CTokenRateMock.json'
import CTokenChiMockArtifact from '../artifacts/contracts/mocks/CTokenChiMock.sol/CTokenChiMock.json'

import JoinArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Join.sol/Join.json'
import LadleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Ladle.sol/Ladle.json'
import WitchArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Witch.sol/Witch.json'
import CauldronArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Cauldron.sol/Cauldron.json'
import FYTokenArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/FYToken.sol/FYToken.json'

import { ERC20Mock } from '../typechain/ERC20Mock'
import { DaiMock } from '../typechain/DaiMock'
import { ERC20 } from '../typechain/ERC20'
import { WETH9Mock } from '../typechain/WETH9Mock'
import { OracleMock } from '../typechain/OracleMock'

import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { ChainlinkAggregatorV3Mock } from '../typechain/ChainlinkAggregatorV3Mock'
import { CTokenRateMock } from '../typechain/CTokenRateMock'
import { CTokenChiMock } from '../typechain/CTokenChiMock'

import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'
import { Join } from '../typechain/Join'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'

import { Pool } from '../typechain/Pool'
import { PoolFactory } from '../typechain/PoolFactory'
import { PoolRouter } from '../typechain/PoolRouter'

import { YieldMath } from '../typechain/YieldMath'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'

const { deployContract } = waffle

export class VaultEnvironment {
  owner: SignerWithAddress
  cauldron: Cauldron
  ladle: LadleWrapper
  poolRouter: PoolRouter
  witch: Witch

  assets: Map<string, ERC20 | ERC20Mock>
  series: Map<string, FYToken>
  pools: Map<string, Pool| Map<string, Pool> >
  joins: Map<string, Join>

  oracles: Map<string, OracleMock>

  vaults: Map<string, Map<string, string>>
  
  constructor(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: LadleWrapper,
    poolRouter: PoolRouter,
    witch: Witch,

    assets: Map<string, ERC20 | ERC20Mock>,
    oracles: Map<string, OracleMock>,
    series: Map<string, FYToken>,
    pools: Map<string, Pool | Map<string, Pool> >,
    joins: Map<string, Join>,

    vaults: Map<string, Map<string, string>>,
    
  ) {
    this.owner = owner
    this.cauldron = cauldron
    this.ladle = ladle
    this.poolRouter = poolRouter
    this.witch = witch
    this.assets = assets
    this.oracles = oracles
    this.series = series
    this.pools = pools
    this.joins = joins
    this.vaults = vaults
  }

  public static async cauldronGovAuth(cauldron: Cauldron, receiver: string) {
    await cauldron.grantRoles(
      [
        id('setAuctionInterval(uint32)'),
        id('addAsset(bytes6,address)'),
        id('addSeries(bytes6,bytes6,address)'),
        id('addIlks(bytes6,bytes6[])'),
        id('setMaxDebt(bytes6,bytes6,uint128)'),
        id('setRateOracle(bytes6,address)'),
        id('setSpotOracle(bytes6,bytes6,address,uint32)'),
      ],
      receiver
    )
  }

  public static async cauldronLadleAuth(cauldron: Cauldron, receiver: string) {
    await cauldron.grantRoles(
      [
        id('build(address,bytes12,bytes6,bytes6)'),
        id('destroy(bytes12)'),
        id('tweak(bytes12,bytes6,bytes6)'),
        id('give(bytes12,address)'),
        id('pour(bytes12,int128,int128)'),
        id('stir(bytes12,bytes12,uint128,uint128)'),
        id('roll(bytes12,bytes6,int128)'),
        id('slurp(bytes12,uint128,uint128)'),
      ],
      receiver
    )
  }

  public static async cauldronWitchAuth(cauldron: Cauldron, receiver: string) {
    await cauldron.grantRoles(
      [
        id('destroy(bytes12)'),
        id('grab(bytes12,address)'),
      ],
      receiver
    )
  }

  public static async ladleGovAuth(ladle: LadleWrapper, receiver: string) {
    await ladle.grantRoles(
      [
        id('addJoin(bytes6,address)'),
        id('addPool(bytes6,address)'),
        id('setPoolRouter(address)'),
        id('setFee(uint256)'),
      ],
      receiver
    )
  }

  public static async ladleWitchAuth(ladle: LadleWrapper, receiver: string) {
    await ladle.grantRoles([
      id(
        'settle(bytes12,address,uint128,uint128)'
      )],
      receiver
    )
  }

  public static async witchGovAuth(witch: Witch, receiver: string) {
    await witch.grantRoles(
      [
        id('setAuctionTime(uint128)'),
        id('setInitialProportion(uint128)'),
      ],
      receiver
    )
  }

  public static async addAsset(owner: SignerWithAddress, cauldron: Cauldron, asset: string, funder:string) {

    let assetContract: ERC20 | ERC20Mock | DaiMock;
    let assetId: string;

    // Handle if a pre-deployed Token (asset is address), or if it requires a deploy (asset is a string)
    if (ethers.utils.isAddress(asset)) {
      assetContract = await ethers.getContractAt('ERC20', asset, owner) as ERC20;
      const _assetSymbol = await assetContract.symbol()
      assetId = ethers.utils.formatBytes32String(_assetSymbol).slice(0, 14)
      // Fund account by transfer from funder
      await transferFromFunder(assetContract.address, await owner.getAddress(), WAD.mul(1000000), funder)
    } else {

      assetId = ethers.utils.formatBytes32String(asset).slice(0, 14)
      if (asset === 'DAI') { 
        assetContract = (await deployContract(owner, DaiMockArtifact, [assetId, asset])) as DaiMock
      } else {
        assetContract = (await deployContract(owner, ERC20MockArtifact, [assetId, asset])) as ERC20Mock
      }
      // Fund the owner account ( through minting because token is mocked)
      await assetContract.mint(await owner.getAddress(), WAD.mul(100000))
    }
    // Add the asset to cauldron
    await cauldron.addAsset(assetId, assetContract.address)
    return { assetId, assetContract }
  }

  public static async addJoin(owner: SignerWithAddress, ladle: LadleWrapper, asset: ERC20|ERC20Mock, assetId: string) {
    const join = (await deployContract(owner, JoinArtifact, [asset.address])) as Join
    await ladle.addJoin(assetId, join.address)
    await asset.approve(join.address, ethers.constants.MaxUint256) // Owner approves all joins to take from him. Only testing
    await join.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], ladle.address)
    return join
  }

  public static async addSpotOracle(owner: SignerWithAddress, cauldron: Cauldron, oracle: ChainlinkMultiOracle, baseId: string, ilkId: string) {
    const ratio = 1000000 //  1000000 == 100% collateralization ratio
    const aggregator = (await deployContract(owner, ChainlinkAggregatorV3MockArtifact, [])) as ChainlinkAggregatorV3Mock
    await aggregator.set(WAD.mul(2))
    await oracle.setSources([baseId], [ilkId], [aggregator.address])
    await cauldron.setSpotOracle(baseId, ilkId, oracle.address, ratio)
    return oracle
  }

  public static async addRateOracle(owner: SignerWithAddress, cauldron: Cauldron, oracle: CompoundMultiOracle, baseId: string) {
    const cTokenRate = (await deployContract(owner, CTokenRateMockArtifact, [])) as CTokenRateMock
    await cTokenRate.set(WAD.mul(2))
    await oracle.setSources([baseId], [RATE], [cTokenRate.address])
    await cauldron.setRateOracle(baseId, oracle.address)
  }

  public static async addChiOracle(owner: SignerWithAddress, oracle: CompoundMultiOracle, baseId: string) { // This will be referenced by the fyToken, and needs no id
    const cTokenChi = (await deployContract(owner, CTokenChiMockArtifact, [])) as CTokenChiMock
    await cTokenChi.set(WAD)
    await oracle.setSources([baseId], [CHI], [cTokenChi.address])
  }

  public static async addSeries(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: LadleWrapper,
    baseJoin: Join,
    chiOracle: CompoundMultiOracle,
    seriesId: string,
    baseId: string,
    ilkIds: Array<string>,
    maturity: number,
  ) {

    const fyToken = (await deployContract(owner, FYTokenArtifact, [
      baseId,
      chiOracle.address,
      baseJoin.address,
      maturity,
      seriesId,
      seriesId,
    ])) as FYToken

    // Add fyToken/series to the Cauldron
    await cauldron.addSeries(seriesId, baseId, fyToken.address)

    // Add all ilks to each series
    await cauldron.addIlks(seriesId, ilkIds)
    await baseJoin.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], fyToken.address)
    await fyToken.grantRoles([id('mint(address,uint256)'), id('burn(address,uint256)')], ladle.address)
    return fyToken
  }

  public static async deployPoolRouter() {

    let router: PoolRouter
    let yieldMathLibrary: YieldMath
    let safeERC20NamerLibrary: SafeERC20Namer
    let factory: PoolFactory

    const WETH9Factory = await ethers.getContractFactory('WETH9Mock')
    const weth9 = ((await WETH9Factory.deploy()) as unknown) as unknown as ERC20
    await weth9.deployed()

    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMathLibrary = ((await YieldMathFactory.deploy()) as unknown) as YieldMath
    await yieldMathLibrary.deployed()

    const SafeERC20NamerFactory = await ethers.getContractFactory('SafeERC20Namer')
    safeERC20NamerLibrary = ((await SafeERC20NamerFactory.deploy()) as unknown) as SafeERC20Namer
    await safeERC20NamerLibrary.deployed()
    
    const PoolFactoryFactory = await ethers.getContractFactory('PoolFactory', {
      libraries: {
        YieldMath: yieldMathLibrary.address,
        SafeERC20Namer: safeERC20NamerLibrary.address,
      },
    })
    factory = ((await PoolFactoryFactory.deploy()) as unknown) as PoolFactory
    await factory.deployed()

    const PoolRouterFactory = await ethers.getContractFactory('PoolRouter')
    router = ((await PoolRouterFactory.deploy(factory.address, weth9.address)) as unknown) as PoolRouter
    await router.deployed()

    return { factory, router}

  }

  public static async addPool(
    owner: SignerWithAddress,
    ladle: LadleWrapper,
    base: ERC20Mock,
    fyToken: FYToken,
    seriesId: string,
    factory: PoolFactory,
    funder: string,
  ) {
    // deploy base/fyToken POOL
    const calculatedAddress = await factory.calculatePoolAddress(base.address, fyToken.address)
    await factory.createPool(base.address, fyToken.address)
    const pool = (await ethers.getContractAt('Pool', calculatedAddress, owner) as unknown) as Pool

    // Supply pool with a million tokens of each for initialization
    try {
      // try minting tokens (as the token owner for mock tokens)
      await base.mint(pool.address, WAD.mul(1000000))
    } catch (e) { 
      // if that doesn't work, try transfering tokens from a whale/funder account
      await transferFromFunder( base.address, pool.address, WAD.mul(1000000), funder)
    }
    // Initialize pool, leaving the minted liquidity tokens in the pool as well
    await pool.mint(pool.address, true, 0)

    // Donate fyToken to the pool to skew it
    await fyToken.mint(pool.address, WAD.mul(1000000).div(9))
    await pool.sync()
    
    await ladle.addPool(seriesId, pool.address)
    return pool
  }

  // Set up a test environment. Provide at least one asset identifier.
  public static async setup(
    owner: SignerWithAddress,
    assetList: Array<Array<string>>, // [ [tokenaddress, funderAddress], ... ]
    baseList: Array<string>,
    maturities: Array<number>,
    buildVaults: boolean = true,
  ) {
    const ownerAdd = await owner.getAddress()

    const cauldron = (await deployContract(owner, CauldronArtifact, [])) as Cauldron
    const innerLadle = (await deployContract(owner, LadleArtifact, [cauldron.address])) as Ladle
    const ladle = new LadleWrapper(innerLadle)
    const witch = (await deployContract(owner, WitchArtifact, [cauldron.address, ladle.address])) as Witch
    const { router: poolRouter, factory }: { router:PoolRouter, factory: PoolFactory } = await this.deployPoolRouter();

    // ==== Orchestration ====
    await this.cauldronLadleAuth(cauldron, ladle.address)
    await this.cauldronWitchAuth(cauldron, witch.address)
    await this.ladleWitchAuth(ladle, witch.address)

    // ==== Owner access (only test environment) ====
    await this.cauldronGovAuth(cauldron, ownerAdd)
    await this.cauldronLadleAuth(cauldron, ownerAdd)
    await this.ladleGovAuth(ladle, ownerAdd)
    await this.ladleWitchAuth(ladle, ownerAdd)
    await this.witchGovAuth(witch, ownerAdd)

    // ==== Set protection period for vaults in liquidation ====
    await cauldron.setAuctionInterval(24 * 60 * 60)

    // ==== Add assets and joins ====
    const assets: Map<string, ERC20|ERC20Mock> = new Map()
    const funders: Map<string, string> = new Map()
    const joins: Map<string, Join> = new Map()

    // For each asset id passed as an argument, we create a Mock ERC20 which we register in cauldron, and its Join, that we register in Ladle.
    // We also give 100 tokens of that asset to the owner account, and approve with the owner for the join to take the asset.
    for (let asset of assetList) {
      // add the asset
      const { assetId, assetContract } = await this.addAsset(owner, cauldron, asset[0], asset[1]) as {assetId:string, assetContract: ERC20|ERC20Mock }
      assets.set(assetId, assetContract)
      funders.set(assetId, asset[1])

      // add join
      const join = await this.addJoin(owner, ladle, assetContract, assetId) as Join
      joins.set(assetId, join)
      await join.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], ownerAdd) // Only test environment
    }

    // Add Ether as an asset, as well as WETH9 and the WETH9 Join
    const weth = (await deployContract(owner, WETH9MockArtifact, [])) as WETH9Mock
    await cauldron.addAsset(ETH, weth.address)
    assets.set(ETH, weth)

    const wethJoin = await this.addJoin(owner, ladle, weth as unknown as ERC20Mock, ETH) as Join
    joins.set(ETH, wethJoin)

    // FOR EACH of the Bases: 
    // 1. set debt limits, 
    // 2. add oracles,
    // 3. add series and pools
    // 4. add in some test vaults

    const oracles: Map<string, OracleMock> = new Map()
    const series: Map<string, FYToken> = new Map()
    const pools: Map<string, Pool> = new Map()
    const vaults: Map<string, Map<string, string>> = new Map()

    for ( let baseSymbol of baseList ) {

      // ==== Get Base contract, and Ilks  ====
      const baseId = ethers.utils.formatBytes32String(baseSymbol).slice(0, 14) // TODO add in check if base symbol is indeed part of the assetList
      // Get a list of the Ilks from the assets map, filtered by the id of the base
      const ilkIds =  Array.from(assets.keys()).filter((x:string) => x !== baseId )

      // Get the baseContract and base join
      const baseContract = assets.get(baseId) as ERC20Mock
      const baseJoin = joins.get(baseId) as Join

      // ==== Set debt limits ====
      for (let ilkId of ilkIds) {
        await cauldron.setMaxDebt(baseId, ilkId, WAD.mul(1000000))
      }

      // ==== Add oracles ====
      const chiRateOracle = (await deployContract(owner, CompoundMultiOracleArtifact, [])) as CompoundMultiOracle
      await this.addRateOracle(owner, cauldron, chiRateOracle, baseId)
      oracles.set(RATE, chiRateOracle as unknown as OracleMock)
      await this.addChiOracle(owner, chiRateOracle, baseId)
      oracles.set(CHI, chiRateOracle as unknown as OracleMock)
  
      const spotOracle = (await deployContract(owner, ChainlinkMultiOracleArtifact, [])) as ChainlinkMultiOracle
      // There is only one base, so the spot oracles we need are one for each ilk, against the only base.
      for (let ilkId of ilkIds) {
        oracles.set(ilkId, await this.addSpotOracle(owner, cauldron, spotOracle, baseId, ilkId) as unknown as OracleMock)
      }

      // ==== Add series and pools ====
      // For each series identifier we create a fyToken with the first asset as underlying.
      for (let maturity of maturities) {

        const seriesId = ethers.utils.hexlify(ethers.utils.randomBytes(6))

        const fyToken = await this.addSeries(owner, cauldron, ladle, baseJoin, chiRateOracle, seriesId, baseId, ilkIds, maturity) as FYToken
        series.set(seriesId, fyToken)
        await fyToken.grantRoles([
          id('mint(address,uint256)'),
          id('burn(address,uint256)'),
          id('setOracle(address)')],
        ownerAdd) // Only test environment
        
        // Add a pool between the base and each series 
        // note: pools structure is Map<string, Map<string, Pool>>
        const baseMap = pools.get(baseId) || new Map();
        const pool = await this.addPool(
          owner, 
          ladle, 
          baseContract, 
          fyToken, 
          seriesId, 
          factory,
          funders.get( baseId ) as string
        )
        pools.set(baseId, baseMap.set(seriesId, pool ))

      // ==== Finally, build some vaults (if requested ) ====
        // For each series and ilk we create a vault - vaults[seriesId][ilkId] = vaultId
        if ( buildVaults ) { 
          const seriesVaults: Map<string, string> = new Map()
          for (let ilkId of ilkIds) {
            await cauldron.build(ownerAdd, ethers.utils.hexlify(ethers.utils.randomBytes(12)), seriesId, ilkId)
            const vaultEvents = (await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null)))
            const vaultId = vaultEvents[vaultEvents.length - 1].args.vaultId
            seriesVaults.set(ilkId, vaultId)
          }
          vaults.set(seriesId, seriesVaults)
        }
      }
  }

    return new VaultEnvironment(owner, cauldron, ladle, poolRouter, witch, assets, oracles, series, pools, joins, vaults )
  }
}
