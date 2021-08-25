import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle } from 'hardhat'
import { verify } from '../shared/helpers'

import { id } from '@yield-protocol/utils-v2'

import CauldronArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Cauldron.sol/Cauldron.json'
import LadleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Ladle.sol/Ladle.json'
import WitchArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Witch.sol/Witch.json'
import JoinFactoryArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/JoinFactory.sol/JoinFactory.json'
import WandArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Wand.sol/Wand.json'
import ChainlinkMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkMultiOracle.sol/ChainlinkMultiOracle.json'
import CompoundMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/compound/CompoundMultiOracle.sol/CompoundMultiOracle.json'
import CompositeMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/composite/CompositeMultiOracle.sol/CompositeMultiOracle.json'
import CTokenMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/compound/CTokenMultiOracle.sol/CTokenMultiOracle.json'
import EmergencyBrakeArtifact from '../artifacts/@yield-protocol/utils-v2/contracts/utils/EmergencyBrake.sol/EmergencyBrake.json'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'
import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { CompositeMultiOracle } from '../typechain/CompositeMultiOracle'
import { CTokenMultiOracle } from '../typechain/CTokenMultiOracle'
import { PoolFactory } from '../typechain/PoolFactory'
import { JoinFactory } from '../typechain/JoinFactory'
import { FYTokenFactory } from '../typechain/FYTokenFactory'
import { Wand } from '../typechain/Wand'

import { YieldMath } from '../typechain/YieldMath'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'

import { EmergencyBrake } from '../typechain/EmergencyBrake'

const { deployContract } = waffle

export class Protocol {
  owner: SignerWithAddress
  cauldron: Cauldron
  ladle: Ladle
  witch: Witch
  chainlinkOracle: ChainlinkMultiOracle
  compoundOracle: CompoundMultiOracle
  compositeOracle: CompositeMultiOracle
  cTokenOracle: CTokenMultiOracle
  poolFactory: PoolFactory
  yieldMath: YieldMath
  safeERC20Namer: SafeERC20Namer
  joinFactory: JoinFactory
  fyTokenFactory: FYTokenFactory
  wand: Wand
  cloak: EmergencyBrake
  
  constructor(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: Ladle,
    witch: Witch,
    chainlinkOracle: ChainlinkMultiOracle,
    compoundOracle: CompoundMultiOracle,
    compositeOracle: CompositeMultiOracle,
    cTokenOracle: CTokenMultiOracle,
    yieldMath: YieldMath,
    safeERC20Namer: SafeERC20Namer,
    poolFactory: PoolFactory,
    joinFactory: JoinFactory,
    fyTokenFactory: FYTokenFactory,
    wand: Wand,
    cloak: EmergencyBrake
  ) {
    this.owner = owner
    this.cauldron = cauldron
    this.ladle = ladle
    this.witch = witch
    this.chainlinkOracle = chainlinkOracle
    this.compoundOracle = compoundOracle
    this.compositeOracle = compositeOracle
    this.cTokenOracle = cTokenOracle
    this.yieldMath = yieldMath
    this.safeERC20Namer = safeERC20Namer
    this.poolFactory = poolFactory
    this.joinFactory = joinFactory
    this.fyTokenFactory = fyTokenFactory
    this.wand = wand
    this.cloak = cloak
  }

  public asMap(): Map<string, any> {
    const protocol = new Map<string, any>()
    protocol.set('owner', this.owner)
    protocol.set('cauldron', this.cauldron)
    protocol.set('ladle', this.ladle)
    protocol.set('witch', this.witch)
    protocol.set('chainlinkOracle', this.chainlinkOracle)
    protocol.set('compoundOracle', this.compoundOracle)
    protocol.set('compositeOracle', this.compositeOracle)
    protocol.set('cTokenOracle', this.cTokenOracle)
    protocol.set('yieldMath', this.yieldMath)
    protocol.set('safeERC20Namer', this.safeERC20Namer)
    protocol.set('poolFactory', this.poolFactory)
    protocol.set('joinFactory', this.joinFactory)
    protocol.set('fyTokenFactory', this.fyTokenFactory)
    protocol.set('wand', this.wand)
    protocol.set('cloak', this.cloak)
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
        id('makeIlk(bytes6,bytes6,address,uint32,uint96,uint24,uint8)'),
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
    verify(poolFactory.address, [], 'safeERC20Namer.js')

    return { yieldMath, safeERC20Namer, poolFactory }
  }

  // Set up a test environment. Provide at least one asset identifier.
  public static async setup(
    owner: SignerWithAddress,
    planner: string,
    executor: string,
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

    const compositeOracle = (await deployContract(owner, CompositeMultiOracleArtifact, [])) as CompositeMultiOracle
    console.log(`[CompositeMultiOracle, '${compositeOracle.address}'],`)
    verify(compositeOracle.address, [])

    const cTokenOracle = (await deployContract(owner, CTokenMultiOracleArtifact, [])) as CTokenMultiOracle
    console.log(`[CTokenMultiOracle, '${cTokenOracle.address}'],`)
    verify(cTokenOracle.address, [])

    const joinFactory = (await deployContract(owner, JoinFactoryArtifact, [])) as JoinFactory
    console.log(`[JoinFactory, '${joinFactory.address}'],`)
    verify(joinFactory.address, [])

    const { yieldMath, safeERC20Namer, poolFactory }:
      { yieldMath: YieldMath, safeERC20Namer: SafeERC20Namer, poolFactory: PoolFactory } =
      await this.deployYieldspace(weth9);

    const fyTokenFactoryFactory = await ethers.getContractFactory('FYTokenFactory', {
      libraries: {
        SafeERC20Namer: safeERC20Namer.address,
      },
    })
    const fyTokenFactory = ((await fyTokenFactoryFactory.deploy()) as unknown) as FYTokenFactory
    await fyTokenFactory.deployed()
    console.log(`[FYTokenFactory, '${fyTokenFactory.address}'],`)
    verify(fyTokenFactory.address, [], 'safeERC20Namer.js')

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

    const cloak = (await deployContract(owner, EmergencyBrakeArtifact, [owner.address, owner.address])) as EmergencyBrake // Give the planner and executor their roles once set up
    console.log(`[Cloak, '${cloak.address}'],`)
    verify(cloak.address, [owner.address, owner.address]) // Give the planner and executor their roles once set up
  
    return new Protocol(owner, cauldron, ladle, witch, chainlinkOracle, compoundOracle, compositeOracle, cTokenOracle, yieldMath, safeERC20Namer, poolFactory, joinFactory, fyTokenFactory, wand, cloak)
  }
}
