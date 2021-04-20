import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { id } from '@yield-protocol/utils'
import { WAD, DAI, USDC } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { Join } from '../typechain/Join'
import { FYToken } from '../typechain/FYToken'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { OracleMock } from '../typechain/OracleMock'
import { Ladle } from '../typechain/Ladle'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'

import { VaultEnvironment } from '../fixtures/vault'
import { fixture } from '../environments/testing';
const { loadFixture } = waffle

describe('FYToken', function () {
  this.timeout(0)

  let env: VaultEnvironment

  let ownerAcc: SignerWithAddress
  let owner: string
  let cauldron: Cauldron
  let fyToken: FYToken
  let base: ERC20Mock
  let baseJoin: Join
  let chiOracle: OracleMock
  let ladle: Ladle

  let vaultId = ethers.utils.hexlify(ethers.utils.randomBytes(12))
  let seriesId: string
  let baseId = DAI
  let ilkId = USDC

  it('test all', async () => {
    env = await loadFixture(fixture);

    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()

    cauldron = env.cauldron as Cauldron
    ladle = env.ladle as Ladle
    base = env.assets.get(baseId) as ERC20Mock
    baseJoin = env.joins.get(baseId) as Join
    seriesId = env.series.keys().next().value as string
    fyToken = env.series.get(seriesId) as FYToken
    chiOracle = env.oracles.get('chi') as OracleMock

    await baseJoin.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], fyToken.address)

    await fyToken.grantRoles([id('mint(address,uint256)'), id('burn(address,uint256)')], owner)

    await cauldron.build(owner, vaultId, seriesId, ilkId)

    await ladle.pour(vaultId, owner, WAD, WAD) // This gives `owner` WAD fyToken

    await base.approve(baseJoin.address, WAD.mul(2))
    await baseJoin.join(owner, WAD.mul(2)) // This loads the base join to serve redemptions

    // it('does not allow to mature before maturity', async () => {
    await expect(fyToken.mature()).to.be.revertedWith('Only after maturity')

    // it('does not allow to redeem before maturity', async () => {
    await expect(fyToken.redeem(owner, WAD)).to.be.revertedWith('Only after maturity')

    // describe('after maturity', async () => {
    await ethers.provider.send('evm_mine', [(await fyToken.maturity()).toNumber()])

    // it('does not allow to mint after maturity', async () => {
    await expect(fyToken.mint(owner, WAD)).to.be.revertedWith('Only before maturity')

    // it('matures by recording the chi value', async () => {
    const maturity = await fyToken.maturity()

    expect(await fyToken.mature())
      .to.emit(fyToken, 'SeriesMatured')
      .withArgs(WAD)

    // it('does not allow to mature more than once', async () => {
    await expect(fyToken.mature()).to.be.revertedWith('Already matured')
    

    // describe('once matured', async () => {
    const accrual = WAD.mul(110).div(100) // accrual is 10%

    // it('redeems fyToken for underlying according to the chi accrual', async () => {
    await chiOracle.set(accrual) // Since spot was 1 when recorded at maturity, accrual is equal to the current spot
    
    const baseOwnerBefore = await base.balanceOf(owner)
    const baseJoinBefore = await base.balanceOf(baseJoin.address)
    await expect(fyToken.redeem(owner, WAD))
      .to.emit(fyToken, 'Redeemed')
      .withArgs(owner, owner, WAD, WAD.mul(accrual).div(WAD))
    expect(await base.balanceOf(baseJoin.address)).to.equal(baseJoinBefore.sub(WAD.mul(accrual).div(WAD)))
    expect(await base.balanceOf(owner)).to.equal(baseOwnerBefore.add(WAD.mul(accrual).div(WAD)))
    expect(await fyToken.balanceOf(owner)).to.equal(0)
  })
})
