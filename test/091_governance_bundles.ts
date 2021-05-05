import { CHI, RATE, WAD, MAX128 as MAX, DAI, USDC, VAULT_OPS as OPS } from '../shared/constants'
import { id } from '@yield-protocol/utils-v2'

import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'
import { Join } from '../typechain/Join'
import { Pool } from '../typechain/Pool'
import { PoolFactory } from '../typechain/PoolFactory'
import { IOracle } from '../typechain/IOracle'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { SourceMock } from '../typechain/SourceMock'

import { LadleWrapper } from '../shared/ladleWrapper'

import ERC20MockArtifact from '../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'
import ChainlinkAggregatorV3MockArtifact from '../artifacts/contracts/mocks/ChainlinkAggregatorV3Mock.sol/ChainlinkAggregatorV3Mock.json'
import CTokenRateMockArtifact from '../artifacts/contracts/mocks/CTokenRateMock.sol/CTokenRateMock.json'
import CTokenChiMockArtifact from '../artifacts/contracts/mocks/CTokenChiMock.sol/CTokenChiMock.json'

import JoinArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Join.sol/Join.json'
import FYTokenArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/FYToken.sol/FYToken.json'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'

import { VaultEnvironment } from '../fixtures/vault'
import { fixture } from '../environments/testing';
import { generateMaturities } from '../shared/helpers';

const { deployContract, loadFixture } = waffle

describe('Governance', function () {
  this.timeout(0)

  let env: VaultEnvironment

  let owner: string
  let other: string

  let cauldron: Cauldron
  let ladle: LadleWrapper
  let chiRateOracle: IOracle
  let spotOracle: IOracle

  let base: ERC20Mock
  let ilk: ERC20Mock
  let spotSource: SourceMock
  let chiSource: SourceMock
  let rateSource: SourceMock

  let baseJoin: Join
  let ilkJoin: Join
  let maturity: Number
  let fyToken: FYToken
  let pool: Pool
  let factory: PoolFactory

  let seriesId = ethers.utils.hexlify(ethers.utils.randomBytes(6))
  let baseId = ethers.utils.hexlify(ethers.utils.randomBytes(6))
  let ilkId = ethers.utils.hexlify(ethers.utils.randomBytes(6))

  it('setup', async () => {
    env = await loadFixture(fixture);

    const signers = await ethers.getSigners()
    owner = await signers[0].getAddress()
    other = await signers[1].getAddress()

    cauldron = env.cauldron as Cauldron
    ladle = env.ladle as LadleWrapper
    factory = env.poolFactory as PoolFactory
    chiRateOracle = (env.oracles.get(CHI) as unknown) as IOracle    
    spotOracle = (env.oracles.get(USDC) as unknown) as IOracle

    base = (await deployContract(owner, ERC20MockArtifact, [baseId, baseId])) as ERC20Mock
    ilk = (await deployContract(owner, ERC20MockArtifact, [ilkId, ilkId])) as ERC20Mock
    spotSource = (await deployContract(owner, ChainlinkAggregatorV3MockArtifact, [])) as SourceMock
    rateSource = (await deployContract(owner, CTokenRateMockArtifact, [])) as SourceMock
    await rateSource.set(WAD.mul(2))
    chiSource = (await deployContract(owner, CTokenChiMockArtifact, [])) as SourceMock
    await chiSource.set(WAD.mul(3))

    maturity = (await generateMaturities(1))[0]
  })

  it('add an asset', async () => {
    // 4b, 6c
    
    // Add asset in Cauldron
    await cauldron.addAsset(baseId, base.address)
    
    // Deploy Join and integrate it with Ladle
    baseJoin = (await deployContract(owner, JoinArtifact, [base.address])) as Join
    await ladle.addJoin(baseId, baseJoin.address)
    await baseJoin.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], ladle.address)
  })

  it('make a base out of an asset', async () => {
    // Asset, 4d

    // Add source to multioracle
    await chiRateOracle.setSources([baseId], [RATE], [rateSource.address])
    
    // Add oracle for base in Cauldron
    await cauldron.setRateOracle(baseId, chiRateOracle.address)
  })

  it('make a collateral out of an asset', async () => {
    // Base, Asset, 4e, 4c 
    
    // Asset - Add asset in Cauldron
    await cauldron.addAsset(ilkId, ilk.address)

    // Deploy Join and integrate it with Ladle
    ilkJoin = (await deployContract(owner, JoinArtifact, [ilk.address])) as Join
    await ladle.addJoin(ilkId, ilkJoin.address)
    await ilkJoin.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], ladle.address)

    // 4e - Add source to multioracle
    await spotOracle.setSources([baseId], [ilkId], [spotSource.address])
    
    // Add oracle for base/ilk pair in Cauldron
    const ratio = 1000000 //  1000000 == 100% collateralization ratio
    await cauldron.setSpotOracle(baseId, ilkId, spotOracle.address, ratio)

    // 4c - Set max debt for the pair
    await cauldron.setMaxDebt(baseId, ilkId, WAD.mul(1000000))
  })

  it('add a series', async () => {
    // Base, Collateral, 3a, 4f, 4g, 5a, 6d

    // 3a - Deploy fyToken
    const fyToken = (await deployContract(owner, FYTokenArtifact, [
      baseId,
      chiRateOracle.address,
      baseJoin.address,
      maturity,
      seriesId,
      seriesId,
    ])) as FYToken

    // 4f - Add fyToken/series to the Cauldron
    await cauldron.addSeries(seriesId, baseId, fyToken.address)

    // Grant access to Join for fyToken to redeem 
    await baseJoin.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], fyToken.address)
    
    // Grant access to fyToken for Ladle to issue and cancel 
    await fyToken.grantRoles([id('mint(address,uint256)'), id('burn(address,uint256)')], ladle.address)

    // 4g - Add relevant ilks to series
    await cauldron.addIlks(seriesId, [ilkId])

    // 5a - Deploy Pool
    const calculatedAddress = await factory.calculatePoolAddress(base.address, fyToken.address)
    await factory.createPool(base.address, fyToken.address)
    const pool = (await ethers.getContractAt('Pool', calculatedAddress, owner) as unknown) as Pool

    // Initialize pool
    await base.mint(pool.address, WAD.mul(1000000))
    await pool.mint(owner, true, 0)

    // 6d - Add pool to Ladle
    await ladle.addPool(seriesId, pool.address)
  })
})
