import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle } from 'hardhat'
import { verify } from '../shared/helpers'

import { id } from '@yield-protocol/utils-v2'
import { LadleWrapper } from '../shared/ladleWrapper'

import CauldronArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Cauldron.sol/Cauldron.json'
import LadleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Ladle.sol/Ladle.json'
import WitchArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Witch.sol/Witch.json'
import JoinFactoryArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/JoinFactory.sol/JoinFactory.json'
import WandArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Wand.sol/Wand.json'
import ChainlinkMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkMultiOracle.sol/ChainlinkMultiOracle.json'
import CompoundMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/compound/CompoundMultiOracle.sol/CompoundMultiOracle.json'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'
import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'

import { PoolFactory } from '../typechain/PoolFactory'
import { PoolRouter } from '../typechain/PoolRouter'
import { JoinFactory } from '../typechain/JoinFactory'
import { FYTokenFactory } from '../typechain/FYTokenFactory'
import { Wand } from '../typechain/Wand'

import { YieldMath } from '../typechain/YieldMath'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'

const { deployContract } = waffle

export class Protocol {
  owner: SignerWithAddress
  cauldron: Cauldron
  ladle: Ladle
  witch: Witch
  chainlinkOracle: ChainlinkMultiOracle
  compoundOracle: CompoundMultiOracle
  poolFactory: PoolFactory
  yieldMath: YieldMath
  safeERC20Namer: SafeERC20Namer
  poolRouter: PoolRouter
  joinFactory: JoinFactory
  fyTokenFactory: FYTokenFactory
  wand: Wand
  
  constructor(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: Ladle,
    witch: Witch,
    chainlinkOracle: ChainlinkMultiOracle,
    compoundOracle: CompoundMultiOracle,
    yieldMath: YieldMath,
    safeERC20Namer: SafeERC20Namer,
    poolFactory: PoolFactory,
    poolRouter: PoolRouter,
    joinFactory: JoinFactory,
    fyTokenFactory: FYTokenFactory,
    wand: Wand,
  ) {
    this.owner = owner
    this.cauldron = cauldron
    this.ladle = ladle
    this.witch = witch
    this.chainlinkOracle = chainlinkOracle
    this.compoundOracle = compoundOracle
    this.yieldMath = yieldMath
    this.safeERC20Namer = safeERC20Namer
    this.poolFactory = poolFactory
    this.poolRouter = poolRouter
    this.joinFactory = joinFactory
    this.fyTokenFactory = fyTokenFactory
    this.wand = wand
  }

  public asMap(): Map<string, any> {
    const protocol = new Map<string, any>()
    protocol.set('owner', this.owner)
    protocol.set('cauldron', this.cauldron)
    protocol.set('ladle', this.ladle)
    protocol.set('witch', this.witch)
    protocol.set('chainlinkOracle', this.chainlinkOracle)
    protocol.set('compoundOracle', this.compoundOracle)
    protocol.set('yieldMath', this.yieldMath)
    protocol.set('safeERC20Namer', this.safeERC20Namer)
    protocol.set('poolFactory', this.poolFactory)
    protocol.set('poolRouter', this.poolRouter)
    protocol.set('joinFactory', this.joinFactory)
    protocol.set('fyTokenFactory', this.fyTokenFactory)
    protocol.set('wand', this.wand)
    return protocol
  }

  public static async cauldronGovAuth(cauldron: Cauldron, receiver: string) {
    await cauldron.grantRoles(
      [
        id('addAsset(bytes6,address)'),
        id('addSeries(bytes6,bytes6,address)'),
        id('addIlks(bytes6,bytes6[])'),
        id('setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
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
      ],
      receiver
    )
  }

  public static async ladleGovAuth(ladle: Ladle, receiver: string) {
    await ladle.grantRoles(
      [
        id('addJoin(bytes6,address)'),
        id('addPool(bytes6,address)'),
        id('setModule(address,bool)'),
        id('setFee(uint256)'),
      ],
      receiver
    )
  }

  public static async wandAuth(wand: Wand, receiver: string) {
    await wand.grantRoles(
      [
        id('addAsset(bytes6,address)'),
        id('makeBase(bytes6,address,address,address)'),
        id('makeIlk(bytes6,bytes6,address,address,uint32,uint96,uint24,uint8)'),
        id('addSeries(bytes6,bytes6,uint32,bytes6[],string,string)'),
        id('addPool(bytes6,bytes6)'),
      ],
      receiver
    )
  }

  public static async cauldronWitchAuth(cauldron: Cauldron, receiver: string) {
    await cauldron.grantRoles(
      [
        id('give(bytes12,address)'),
        id('grab(bytes12,address)'),
        id('slurp(bytes12,uint128,uint128)')
      ],
      receiver
    )
  }

  public static async witchGovAuth(witch: Witch, receiver: string) {
    await witch.grantRoles(
      [
        id('setIlk(bytes6,uint32,uint64,uint128)')
      ],
      receiver
    )
  }

  public static async joinFactoryAuth(joinFactory: JoinFactory, receiver: string) {
    await joinFactory.grantRoles([id('createJoin(address)')], receiver)
  }

  public static async fyTokenFactoryAuth(fyTokenFactory: FYTokenFactory, receiver: string) {
    await fyTokenFactory.grantRoles([id('createFYToken(bytes6,address,address,uint32,string,string)')], receiver)
  }

  public static async deployYieldspace(weth9: string) {

    let poolRouter: PoolRouter
    let yieldMath: YieldMath
    let safeERC20Namer: SafeERC20Namer
    let poolFactory: PoolFactory

    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMath = ((await YieldMathFactory.deploy()) as unknown) as YieldMath
    await yieldMath.deployed()
    console.log(`[YieldMath, '${yieldMath.address}'],`)
    verify(yieldMath.address, [])

    const SafeERC20NamerFactory = await ethers.getContractFactory('SafeERC20Namer')
    safeERC20Namer = ((await SafeERC20NamerFactory.deploy()) as unknown) as SafeERC20Namer
    await safeERC20Namer.deployed()
    console.log(`[SafeERC20Namer, '${safeERC20Namer.address}'],`)
    verify(safeERC20Namer.address, [])
    
    const poolLibs = {
      YieldMath: yieldMath.address,
      SafeERC20Namer: safeERC20Namer.address,
    }
    const PoolFactoryFactory = await ethers.getContractFactory('PoolFactory', {
      libraries: poolLibs,
    })
    poolFactory = ((await PoolFactoryFactory.deploy()) as unknown) as PoolFactory
    await poolFactory.deployed()
    console.log(`[PoolFactory, '${poolFactory.address}'],`)
    verify(poolFactory.address, [], { SafeERC20Namer: safeERC20Namer.address })

    const PoolRouterFactory = await ethers.getContractFactory('PoolRouter')
    poolRouter = ((await PoolRouterFactory.deploy(poolFactory.address, weth9)) as unknown) as PoolRouter
    await poolRouter.deployed()
    console.log(`[PoolRouter, '${poolRouter.address}'],`)
    verify(poolRouter.address, [poolFactory.address, weth9])

    return { yieldMath, safeERC20Namer, poolFactory, poolRouter }
  }

  // Set up a test environment. Provide at least one asset identifier.
  public static async setup(
    owner: SignerWithAddress,
    weth9: string,
  ) {
    const cauldron = (await deployContract(owner, CauldronArtifact, [])) as Cauldron
    console.log(`[Cauldron, '${cauldron.address}'],`)
    verify(cauldron.address, [])

    const ladle = (await deployContract(owner, LadleArtifact, [cauldron.address, weth9])) as Ladle
    console.log(`[Ladle, '${ladle.address}'],`)
    verify(ladle.address, [cauldron.address, weth9])
    // const ladle = new LadleWrapper(innerLadle)

    const witch = (await deployContract(owner, WitchArtifact, [cauldron.address, ladle.address])) as Witch
    console.log(`[Witch, '${witch.address}'],`)
    verify(witch.address, [cauldron.address, ladle.address])

    const compoundOracle = (await deployContract(owner, CompoundMultiOracleArtifact, [])) as CompoundMultiOracle
    console.log(`[CompoundMultiOracle, '${compoundOracle.address}'],`)
    verify(compoundOracle.address, [])

    const chainlinkOracle = (await deployContract(owner, ChainlinkMultiOracleArtifact, [])) as ChainlinkMultiOracle
    console.log(`[ChainlinkMultiOracle, '${chainlinkOracle.address}'],`)
    verify(chainlinkOracle.address, [])

    const joinFactory = (await deployContract(owner, JoinFactoryArtifact, [])) as JoinFactory
    console.log(`[JoinFactory, '${joinFactory.address}'],`)
    verify(joinFactory.address, [])

    const { yieldMath, safeERC20Namer, poolFactory, poolRouter }:
      { yieldMath: YieldMath, safeERC20Namer: SafeERC20Namer, poolFactory: PoolFactory, poolRouter:PoolRouter } =
      await this.deployYieldspace(weth9);

    const fyTokenFactoryFactory = await ethers.getContractFactory('FYTokenFactory', {
      libraries: {
        SafeERC20Namer: safeERC20Namer.address,
      },
    })
    const fyTokenFactory = ((await fyTokenFactoryFactory.deploy()) as unknown) as FYTokenFactory
    await fyTokenFactory.deployed()
    console.log(`[FYTokenFactory, '${fyTokenFactory.address}'],`)
    verify(fyTokenFactory.address, [], { SafeERC20Namer: safeERC20Namer.address })

    const wand = (await deployContract(owner, WandArtifact, [
      cauldron.address,
      ladle.address,
      witch.address,
      poolFactory.address,
      joinFactory.address,
      fyTokenFactory.address,
    ])) as Wand
    console.log(`[Wand, '${wand.address}'],`)
    verify(wand.address, [cauldron.address, ladle.address, poolFactory.address, joinFactory.address, fyTokenFactory.address])
  
    return new Protocol(owner, cauldron, ladle, witch, chainlinkOracle, compoundOracle, yieldMath, safeERC20Namer, poolFactory, poolRouter, joinFactory, fyTokenFactory, wand)
  }
}
