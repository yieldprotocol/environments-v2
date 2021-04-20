import { WAD, MAX128 as MAX, DAI, USDC, VAULT_OPS as OPS } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { FYToken } from '../typechain/FYToken'
import { Pool } from '../typechain/Pool'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { Ladle } from '../typechain/Ladle'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'

import { VaultEnvironment } from '../fixtures/vault'
import { fixture } from '../environments/testing';
const { loadFixture } = waffle

describe('Ladle - serve and repay', function () {
  this.timeout(0)

  let env: VaultEnvironment

  let owner: string
  let other: string

  let cauldron: Cauldron
  let ladle: Ladle
  let base: ERC20Mock
  let ilk: ERC20Mock
  let fyToken: FYToken
  let pool: Pool

  let vaultId = ethers.utils.hexlify(ethers.utils.randomBytes(12))
  let seriesId: string
  let baseId = DAI
  let ilkId = USDC

  it('test all', async () => {
    env = await loadFixture(fixture);

    const signers = await ethers.getSigners()
    owner = await signers[0].getAddress()
    other = await signers[1].getAddress()

    cauldron = env.cauldron as Cauldron
    ladle = env.ladle as Ladle
    base = env.assets.get(baseId) as ERC20Mock
    ilk = env.assets.get(ilkId) as ERC20Mock
    seriesId = env.series.keys().next().value as string
    fyToken = env.series.get(seriesId) as FYToken
    pool = (env.pools.get(baseId) as Map<string, Pool>).get(seriesId) as Pool

    // it('borrows an amount of base', async () => {
    let baseBalanceBefore = await base.balanceOf(other)
    const ilkBalanceBefore = await ilk.balanceOf(owner)
    const baseBorrowed = WAD
    // const expectedDebtInFY = baseBorrowed.mul(105).div(100) // TODO: Import yieldspace.ts and get a proper estimation
    const inkPosted = WAD.mul(2)

    await expect(ladle.build(vaultId, seriesId, ilkId))
    .to.emit(cauldron, 'VaultBuilt')
    .withArgs(vaultId, owner, seriesId, ilkId)

    await ladle.serve(vaultId, other, inkPosted, baseBorrowed, MAX)
    
    /* await expect(await ladle.serve(vaultId, other, inkPosted, baseBorrowed, MAX))
      .to.emit(cauldron, 'VaultPoured')
      .withArgs(vaultId, seriesId, ilkId, inkPosted, expectedDebtInFY)
      .to.emit(pool, 'Trade')
      .withArgs(await fyToken.maturity(), ladle.address, other, baseBorrowed.mul(-1), expectedDebtInFY) */
    expect((await cauldron.balances(vaultId)).ink).to.equal(inkPosted)
    // expect((await cauldron.balances(vaultId)).art).to.equal(expectedDebtInFY)
    expect(await base.balanceOf(other)).to.equal(baseBalanceBefore.add(baseBorrowed))
    expect(await ilk.balanceOf(owner)).to.equal(ilkBalanceBefore.sub(inkPosted))

    
    // it('repays debt with base', async () => {
    await loadFixture(fixture);
    await ladle.build(vaultId, seriesId, ilkId)
    await ladle.pour(vaultId, owner, WAD, WAD)

    baseBalanceBefore = await base.balanceOf(owner)
    let debtRepaidInBase = WAD.div(2)
    // const debtRepaidInFY = debtRepaidInBase.mul(105).div(100) // TODO: Import yieldspace.ts and get a proper estimation
    let inkRetrieved = WAD.div(4)

    await base.transfer(pool.address, debtRepaidInBase) // This would normally be part of a multicall, using ladle.transferToPool

    await ladle.repay(vaultId, owner, inkRetrieved, 0)

    /* await expect(await ladle.repay(vaultId, owner, inkRetrieved, 0))
      .to.emit(cauldron, 'VaultPoured')
      .withArgs(vaultId, seriesId, ilkId, inkRetrieved, debtRepaidInFY.mul(-1))
      .to.emit(pool, 'Trade')
      .withArgs(await fyToken.maturity(), ladle.address, fyToken.address, debtRepaidInBase, debtRepaidInFY.mul(-1)) */
    
    // expect((await cauldron.balances(vaultId)).art).to.equal(WAD.sub(debtRepaidInFY))
    expect(await base.balanceOf(owner)).to.equal(baseBalanceBefore.sub(debtRepaidInBase))

  // it('repays debt with base in a batch', async () => {
    await loadFixture(fixture);
    await ladle.build(vaultId, seriesId, ilkId)
    await ladle.pour(vaultId, owner, WAD, WAD)

    baseBalanceBefore = await base.balanceOf(owner)
    debtRepaidInBase = WAD.div(2)
    // const debtRepaidInFY = debtRepaidInBase.mul(105).div(100)
    inkRetrieved = WAD.div(4)

    let transferToPoolData = ethers.utils.defaultAbiCoder.encode(['bool', 'uint128'], [true, debtRepaidInBase])
    const repayData = ethers.utils.defaultAbiCoder.encode(['address', 'int128', 'uint128'], [owner, inkRetrieved, 0])

    await base.approve(ladle.address, debtRepaidInBase) // This would normally be part of a multicall, using ladle.forwardPermit
    await ladle.batch(vaultId, [OPS.TRANSFER_TO_POOL, OPS.REPAY], [transferToPoolData, repayData])
    /* await expect(ladle.batch(vaultId, [OPS.TRANSFER_TO_POOL, OPS.REPAY], [transferToPoolData, repayData]))
      .to.emit(cauldron, 'VaultPoured')
      .withArgs(vaultId, seriesId, ilkId, inkRetrieved, debtRepaidInFY.mul(-1))
      .to.emit(pool, 'Trade')
      .withArgs(await fyToken.maturity(), ladle.address, fyToken.address, debtRepaidInBase, debtRepaidInFY.mul(-1)) */
    // expect((await cauldron.balances(vaultId)).art).to.equal(WAD.sub(debtRepaidInFY))
    expect(await base.balanceOf(owner)).to.equal(baseBalanceBefore.sub(debtRepaidInBase))

    // it('repays all debt of a vault with base', async () => {
    await ladle.pour(vaultId, owner, WAD, WAD)

    baseBalanceBefore = await base.balanceOf(owner)
    let baseOffered = WAD.mul(2)
    let debtinFY = WAD
    // const debtinBase = debtinFY.mul(100).div(105)
    inkRetrieved = WAD.div(4)

    await base.transfer(pool.address, baseOffered) // This would normally be part of a multicall, using ladle.transferToPool
    await ladle.repayVault(vaultId, owner, inkRetrieved, MAX)
    /* await expect(await ladle.repayVault(vaultId, owner, inkRetrieved, MAX))
      .to.emit(cauldron, 'VaultPoured')
      .withArgs(vaultId, seriesId, ilkId, inkRetrieved, WAD.mul(-1))
      .to.emit(pool, 'Trade')
      .withArgs(await fyToken.maturity(), ladle.address, fyToken.address, debtinBase, debtinFY.mul(-1))
    await pool.retrieveBaseToken(owner) */

    expect((await cauldron.balances(vaultId)).art).to.equal(0)
    // expect(await base.balanceOf(owner)).to.equal(baseBalanceBefore.sub(debtinBase))

  // it('repays all debt of a vault with base in a batch', async () => {
    await ladle.pour(vaultId, owner, WAD, WAD)

    baseBalanceBefore = await base.balanceOf(owner)
    baseOffered = WAD.mul(2)
    debtinFY = WAD
    // const debtInBase = debtinFY.mul(100).div(105)
    inkRetrieved = WAD.div(4)

    transferToPoolData = ethers.utils.defaultAbiCoder.encode(['bool', 'uint128'], [true, baseOffered])
    const repayVaultData = ethers.utils.defaultAbiCoder.encode(
      ['address', 'int128', 'uint128'],
      [owner, inkRetrieved, MAX]
    )
    const retrieveFromPoolData = ethers.utils.defaultAbiCoder.encode(['bool', 'address'], [true, owner])

    await base.approve(ladle.address, baseOffered) // This would normally be part of a multicall, using ladle.forwardPermit
    await ladle.batch(
      vaultId,
      [OPS.TRANSFER_TO_POOL, OPS.REPAY_VAULT, OPS.RETRIEVE_FROM_POOL],
      [transferToPoolData, repayVaultData, retrieveFromPoolData]
    )
    /* await expect(
      ladle.batch(
        vaultId,
        [OPS.TRANSFER_TO_POOL, OPS.REPAY_VAULT, OPS.RETRIEVE_FROM_POOL],
        [transferToPoolData, repayVaultData, retrieveFromPoolData]
      )
    )
      .to.emit(cauldron, 'VaultPoured')
      .withArgs(vaultId, seriesId, ilkId, inkRetrieved, WAD.mul(-1))
      .to.emit(pool, 'Trade')
      .withArgs(await fyToken.maturity(), ladle.address, fyToken.address, debtInBase, debtinFY.mul(-1)) */

    expect((await cauldron.balances(vaultId)).art).to.equal(0)
    // expect(await base.balanceOf(owner)).to.equal(baseBalanceBefore.sub(debtInBase))
  })
})
