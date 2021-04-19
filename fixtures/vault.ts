import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle, network } from 'hardhat'
import { BigNumber } from 'ethers'

import { id } from '@yield-protocol/utils'
import { DEC6, WAD, RAY, THREE_MONTHS } from '../shared/constants'

import { transferFromFunder } from '../shared/helpers'

import JoinArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Join.sol/Join.json'
import LadleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Ladle.sol/Ladle.json'
import WitchArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Witch.sol/Witch.json'
import CauldronArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Cauldron.sol/Cauldron.json'
import FYTokenArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/FYToken.sol/FYToken.json'

import ERC20MockArtifact from '../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'
import WETH9MockArtifact from '../artifacts/contracts/mocks/WETH9Mock.sol/WETH9Mock.json'
import OracleMockArtifact from '../artifacts/contracts/mocks/OracleMock.sol/OracleMock.json'

import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { ERC20 } from '../typechain/ERC20'
import { WETH9Mock } from '../typechain/WETH9Mock'
import { OracleMock } from '../typechain/OracleMock'
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
  ladle: Ladle
  poolRouter: PoolRouter
  witch: Witch

  assets: Map<string, ERC20 | ERC20Mock>
  oracles: Map<string, OracleMock>
  series: Map<string, FYToken>
  pools: Map<string, Pool| Map<string, Pool> >
  joins: Map<string, Join>
  vaults: Map<string, Map<string, string>>
  
  constructor(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: Ladle,
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

  public static async cauldronGovAuth(owner: SignerWithAddress, cauldron: Cauldron, receiver: string) {
    await cauldron.grantRoles(
      [
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

  public static async cauldronLadleAuth(owner: SignerWithAddress, cauldron: Cauldron, receiver: string) {
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

  public static async cauldronWitchAuth(owner: SignerWithAddress, cauldron: Cauldron, receiver: string) {
    await cauldron.grantRoles(
      [
        id('destroy(bytes12)'),
        id('grab(bytes12)'),
      ],
      receiver
    )
  }

  public static async ladleGovAuth(owner: SignerWithAddress, ladle: Ladle, receiver: string) {
    await ladle.grantRoles(
      [
        id('addJoin(bytes6,address)'),
        id('addPool(bytes6,address)'),
      ],
      receiver
    )
  }

  public static async ladleWitchAuth(owner: SignerWithAddress, ladle: Ladle, receiver: string) {
    await ladle.grantRoles([
      id(
        'settle(bytes12,address,uint128,uint128)'
      )],
      receiver
    )
  }

  public static async addAsset(owner: SignerWithAddress, cauldron: Cauldron, asset: string, funder:string) {

    let assetContract: ERC20 | ERC20Mock;
    let assetId: string;

    // Handle if a pre-deployed Token (asset is address), or if it requires a deploy (asset is a string)
    if (ethers.utils.isAddress(asset)) {
      assetContract = await ethers.getContractAt('ERC20', asset, owner) as ERC20;
      const _assetSymbol = await assetContract.symbol()
      assetId = ethers.utils.formatBytes32String(_assetSymbol).slice(0, 14)
      // Fund account by transfer from funder
      await transferFromFunder(assetContract.address, await owner.getAddress(), WAD.mul(1000000), funder)

    } else {
      // const symbol = Buffer.from(asset.slice(2), 'hex').toString('utf8')
      assetId = ethers.utils.formatBytes32String(asset).slice(0, 14)
      assetContract = (await deployContract(owner, ERC20MockArtifact, [assetId, asset])) as ERC20Mock
      // Fund the owner account ( through minting because token is mocked)
      await assetContract.mint(await owner.getAddress(), WAD.mul(100000))
      
    }
    // Add the asset to cauldron
    await cauldron.addAsset(assetId, assetContract.address)
    return { assetId, assetContract }
  }

  public static async addJoin(owner: SignerWithAddress, ladle: Ladle, asset: ERC20|ERC20Mock, assetId: string) {
    const join = (await deployContract(owner, JoinArtifact, [asset.address])) as Join
    await ladle.addJoin(assetId, join.address)
    await asset.approve(join.address, ethers.constants.MaxUint256) // Owner approves all joins to take from him. Only testing
    await join.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], ladle.address)
    return join
  }

  public static async addSpotOracle(owner: SignerWithAddress, cauldron: Cauldron, baseId: string, ilkId: string) {
    const ratio = 1000000 //  1000000 == 100% collateralization ratio
    const oracle = (await deployContract(owner, OracleMockArtifact, [])) as OracleMock
    await oracle.setSpot(DEC6.mul(2))
    await cauldron.setSpotOracle(baseId, ilkId, oracle.address, ratio)
    return oracle
  }

  public static async addRateOracle(owner: SignerWithAddress, cauldron: Cauldron, baseId: string) {
    const oracle = (await deployContract(owner, OracleMockArtifact, [])) as OracleMock
    await oracle.setSpot(DEC6.mul(2))
    await cauldron.setRateOracle(baseId, oracle.address)
    return oracle
  }

  public static async addChiOracle(owner: SignerWithAddress) { // This will be referenced by the fyToken, and needs no id
    const oracle = (await deployContract(owner, OracleMockArtifact, [])) as OracleMock
    await oracle.setSpot(DEC6)
    return oracle
  }

  public static async addSeries(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: Ladle,
    baseJoin: Join,
    chiOracle: OracleMock,
    seriesId: string,
    baseId: string,
    ilkIds: Array<string>,
    maturity: number,
  ) {

    const fyToken = (await deployContract(owner, FYTokenArtifact, [
      chiOracle.address,
      baseJoin.address,
      maturity,
      seriesId,
      seriesId,
    ])) as FYToken

    // Add fyToken/series to the Cauldron
    console.log(`Series ${ seriesId } uses base ${ baseId }`)
    await cauldron.addSeries(seriesId, baseId, fyToken.address)

    // Add all ilks to each series
    console.log(`Adding ilks ${ ilkIds } to series ${ seriesId }`)
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

    const DaiFactory = await ethers.getContractFactory('DaiMock')
    const dai = ((await DaiFactory.deploy('DAI', 'DAI')) as unknown) as unknown as ERC20
    await dai.deployed()

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
    ladle: Ladle,
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

    // Initialize pool with a million tokens of each
    try {
      // try minting tokens (as the token owner for mock tokens)
      await base.mint(pool.address, WAD.mul(1000000))
    } catch (e) { 
      // if that doesn't work, try transfering tokens from a whale/funder account
      await transferFromFunder( base.address, pool.address, WAD.mul(1000000), funder)
    }
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
    const ladle = (await deployContract(owner, LadleArtifact, [cauldron.address])) as Ladle
    const witch = (await deployContract(owner, WitchArtifact, [cauldron.address, ladle.address])) as Witch
    const { router: poolRouter, factory }: { router:PoolRouter, factory: PoolFactory } = await this.deployPoolRouter();

    // ==== Orchestration ====
    await this.cauldronLadleAuth(owner, cauldron, ladle.address)
    await this.cauldronWitchAuth(owner, cauldron, witch.address)
    await this.ladleWitchAuth(owner, ladle, witch.address)

    // ==== Owner access (only test environment) ====
    await this.cauldronGovAuth(owner, cauldron, ownerAdd)
    await this.cauldronLadleAuth(owner, cauldron, ownerAdd)
    await this.ladleGovAuth(owner, ladle, ownerAdd)
    await this.ladleWitchAuth(owner, ladle, ownerAdd)

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
    const ethId = ethers.utils.formatBytes32String('ETH').slice(0, 14)
    const weth = (await deployContract(owner, WETH9MockArtifact, [])) as WETH9Mock
    await cauldron.addAsset(ethId, weth.address)
    assets.set(ethId, weth)

    const wethJoin = await this.addJoin(owner, ladle, weth as unknown as ERC20Mock, ethId) as Join
    joins.set(ethId, wethJoin)

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
      const rateOracle = await this.addRateOracle(owner, cauldron, baseId) as OracleMock
      oracles.set('rate', rateOracle)
      const chiOracle = await this.addChiOracle(owner) as OracleMock
      oracles.set('chi', chiOracle)
      
      for (let ilkId of ilkIds) {
        oracles.set(ilkId, await this.addSpotOracle(owner, cauldron, baseId, ilkId) as OracleMock)
      }

      // ==== Add series and pools ====
      // For each series identifier we create a fyToken with the first asset as underlying.
      for (let maturity of maturities) {

        const seriesId = ethers.utils.hexlify(ethers.utils.randomBytes(6))

        const fyToken = await this.addSeries(owner, cauldron, ladle, baseJoin, chiOracle, seriesId, baseId, ilkIds, maturity) as FYToken
        series.set(seriesId, fyToken)
        await fyToken.grantRoles([id('mint(address,uint256)'), id('burn(address,uint256)')], ownerAdd) // Only test environment
        
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
