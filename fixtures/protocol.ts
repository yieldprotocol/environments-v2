import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ethers, waffle, network } from 'hardhat'
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
import { Wand } from '../typechain/Wand'

import { YieldMath } from '../typechain/YieldMath'
import { SafeERC20Namer } from '../typechain/SafeERC20Namer'

const { deployContract } = waffle

export class Protocol {
  owner: SignerWithAddress
  cauldron: Cauldron
  ladle: LadleWrapper
  witch: Witch
  chainlinkOracle: ChainlinkMultiOracle
  compoundOracle: CompoundMultiOracle
  poolRouter: PoolRouter
  poolFactory: PoolFactory
  joinFactory: JoinFactory
  wand: Wand
  
  constructor(
    owner: SignerWithAddress,
    cauldron: Cauldron,
    ladle: LadleWrapper,
    witch: Witch,
    chainlinkOracle: ChainlinkMultiOracle,
    compoundOracle: CompoundMultiOracle,
    poolRouter: PoolRouter,
    poolFactory: PoolFactory,
    joinFactory: JoinFactory,
    wand: Wand,
  ) {
    this.owner = owner
    this.cauldron = cauldron
    this.ladle = ladle
    this.witch = witch
    this.chainlinkOracle = chainlinkOracle
    this.compoundOracle = compoundOracle
    this.poolRouter = poolRouter
    this.poolFactory = poolFactory
    this.joinFactory = joinFactory
    this.wand = wand
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
    ); console.log(`cauldron.grantRoles(gov, ${receiver})`)
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
    ); console.log(`cauldron.grantRoles(ladle, ${receiver})`)
  }

  public static async ladleGovAuth(ladle: LadleWrapper, receiver: string) {
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
        id('makeIlk(bytes6,bytes6,address,address,uint32,uint128)'),
        id('addSeries(bytes6,bytes6,uint32,bytes6[],string,string)'),
        id('addPool(bytes6,bytes6)'),
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
    ); console.log(`cauldron.grantRoles(witch, ${receiver})`)
  }

  public static async ladleWitchAuth(ladle: LadleWrapper, receiver: string) {
    await ladle.grantRoles([
      id(
        'settle(bytes12,address,uint128,uint128)'
      )],
      receiver
    ); console.log(`ladle.grantRoles(witch, ${receiver})`)
  }

  public static async witchGovAuth(witch: Witch, receiver: string) {
    await witch.grantRoles(
      [
        id('setAuctionTime(uint128)'),
        id('setInitialProportion(uint128)'),
      ],
      receiver
    ); console.log(`witch.grantRoles(gov, ${receiver})`)
  }

  public static async deployPoolRouter(weth9: string) {

    let router: PoolRouter
    let yieldMathLibrary: YieldMath
    let safeERC20NamerLibrary: SafeERC20Namer
    let poolFactory: PoolFactory

    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMathLibrary = ((await YieldMathFactory.deploy()) as unknown) as YieldMath
    await yieldMathLibrary.deployed()
    console.log(`Deployed YieldMath at ${yieldMathLibrary.address}`)

    const SafeERC20NamerFactory = await ethers.getContractFactory('SafeERC20Namer')
    safeERC20NamerLibrary = ((await SafeERC20NamerFactory.deploy()) as unknown) as SafeERC20Namer
    await safeERC20NamerLibrary.deployed()
    console.log(`Deployed SafeERC20Namer at ${safeERC20NamerLibrary.address}`)
    
    const PoolFactoryFactory = await ethers.getContractFactory('PoolFactory', {
      libraries: {
        YieldMath: yieldMathLibrary.address,
        SafeERC20Namer: safeERC20NamerLibrary.address,
      },
    })
    poolFactory = ((await PoolFactoryFactory.deploy()) as unknown) as PoolFactory
    await poolFactory.deployed()
    console.log(`Deployed Pool Factory at ${poolFactory.address}`)

    const PoolRouterFactory = await ethers.getContractFactory('PoolRouter')
    router = ((await PoolRouterFactory.deploy(poolFactory.address, weth9)) as unknown) as PoolRouter
    await router.deployed()
    console.log(`Deployed Pool Router at ${router.address}`)

    return { poolFactory, router }

  }

  // Set up a test environment. Provide at least one asset identifier.
  public static async setup(
    owner: SignerWithAddress,
    weth9: string,
  ) {
    const ownerAdd = await owner.getAddress()

    const cauldron = (await deployContract(owner, CauldronArtifact, [])) as Cauldron
    verify(cauldron.address, [])
    console.log(`Deployed Cauldron at ${cauldron.address}`)

    const innerLadle = (await deployContract(owner, LadleArtifact, [cauldron.address])) as Ladle
    const ladle = new LadleWrapper(innerLadle)
    verify(innerLadle.address, [cauldron.address])
    console.log(`Deployed Ladle at ${innerLadle.address}`)

    const witch = (await deployContract(owner, WitchArtifact, [cauldron.address, ladle.address])) as Witch
    verify(witch.address, [cauldron.address, ladle.address])
    console.log(`Deployed Witch at ${witch.address}`)

    const compoundOracle = (await deployContract(owner, CompoundMultiOracleArtifact, [])) as CompoundMultiOracle
    verify(compoundOracle.address, [])
    console.log(`Deployed Compound MultiOracle at ${compoundOracle.address}`)

    const chainlinkOracle = (await deployContract(owner, ChainlinkMultiOracleArtifact, [])) as ChainlinkMultiOracle
    verify(chainlinkOracle.address, [])
    console.log(`Deployed Chainlink MultiOracle at ${chainlinkOracle.address}`)

    const joinFactory = (await deployContract(owner, JoinFactoryArtifact, [])) as JoinFactory
    console.log(`Deployed Join Factory at ${joinFactory.address}`)

    const { router: poolRouter, poolFactory }: { router:PoolRouter, poolFactory: PoolFactory } = await this.deployPoolRouter(weth9);
    console.log(`Deployed Pool Router at ${poolRouter.address}`)
    console.log(`Deployed Pool Factory at ${poolFactory.address}`)

    const wand = (await deployContract(owner, WandArtifact, [cauldron.address, ladle.address, poolFactory.address, joinFactory.address])) as Wand
    verify(wand.address, [cauldron.address, ladle.address, poolFactory.address, joinFactory.address])
    console.log(`Deployed Wand at ${wand.address}`)

    // ==== Orchestration ====
    await this.cauldronLadleAuth(cauldron, ladle.address)
    await this.cauldronWitchAuth(cauldron, witch.address)
    await this.ladleWitchAuth(ladle, witch.address)
  
    await this.cauldronGovAuth(cauldron, wand.address)
    await this.ladleGovAuth(ladle, wand.address)
    await this.witchGovAuth(witch, wand.address)
    await compoundOracle.transferOwnership(wand.address)
    await chainlinkOracle.transferOwnership(wand.address)

  
    return new Protocol(owner, cauldron, ladle, witch, chainlinkOracle, compoundOracle, poolRouter, poolFactory, joinFactory, wand )
  }
}
