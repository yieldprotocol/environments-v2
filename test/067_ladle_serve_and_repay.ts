import *  as fs from 'fs'
import { WAD, MAX128 as MAX, DAI, USDC } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { FYToken } from '../typechain/FYToken'
import { Pool } from '../typechain/Pool'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { LadleWrapper } from '../shared/ladleWrapper'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'
import { jsonToMap } from '../shared/helpers'

describe('Ladle - serve and repay', function () {
  this.timeout(0)

  let owner: string
  let other: string

  let cauldron: Cauldron
  let innerLadle: Ladle
  let ladle: LadleWrapper
  let base: ERC20Mock
  let ilk: ERC20Mock
  let fyToken: FYToken
  let pool: Pool

  let vaultId = ethers.utils.hexlify(ethers.utils.randomBytes(12))
  let seriesId: string
  let baseId = DAI
  let ilkId = USDC

  it('test all', async () => {

    const [ownerAcc, otherAcc] = await ethers.getSigners()
    owner = await ownerAcc.getAddress()
    other = await otherAcc.getAddress()


    const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string, string>;
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
    const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string, string>;
    const fyTokens = jsonToMap(fs.readFileSync('./output/fyTokens.json', 'utf8')) as Map<string, string>;
    const pools = jsonToMap(fs.readFileSync('./output/pools.json', 'utf8')) as Map<string, string>;

    cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as Cauldron
    innerLadle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as Ladle
    ladle = new LadleWrapper(innerLadle)
    base = await ethers.getContractAt('ERC20Mock', assets.get(baseId) as string, ownerAcc) as ERC20Mock
    ilk = await ethers.getContractAt('ERC20Mock', assets.get(ilkId) as string, ownerAcc) as ERC20Mock
    const ilkJoinAddress = joins.get(ilkId) as string
    seriesId = fyTokens.keys().next().value as string
    fyToken = await ethers.getContractAt('FYToken', fyTokens.get(seriesId) as string, ownerAcc) as FYToken
    pool = await ethers.getContractAt('Pool', pools.get(seriesId) as string, ownerAcc) as Pool

    await ilk.approve(ilkJoinAddress, MAX)

    console.log('borrows an amount of base')
    let baseBalanceBefore = await base.balanceOf(other)
    const ilkBalanceBefore = await ilk.balanceOf(owner)
    const baseBorrowed = WAD.mul(2)
    // const expectedDebtInFY = baseBorrowed.mul(105).div(100) // TODO: Import yieldspace.ts and get a proper estimation
    const inkPosted = WAD.mul(5)

    await ladle.build(vaultId, seriesId, ilkId)
    await ladle.serve(vaultId, other, inkPosted, baseBorrowed, MAX)
    
    expect((await cauldron.balances(vaultId)).ink).to.equal(inkPosted)
    expect(await base.balanceOf(other)).to.equal(baseBalanceBefore.add(baseBorrowed))
    expect(await ilk.balanceOf(owner)).to.equal(ilkBalanceBefore.sub(inkPosted))
    
    console.log('repays debt with base')
    vaultId = ethers.utils.hexlify(ethers.utils.randomBytes(12))
    await ladle.build(vaultId, seriesId, ilkId)
    await ladle.pour(vaultId, owner, inkPosted, baseBorrowed)

    baseBalanceBefore = await base.balanceOf(owner)
    let debtRepaidInBase = WAD.div(4)
    // const debtRepaidInFY = debtRepaidInBase.mul(105).div(100) // TODO: Import yieldspace.ts and get a proper estimation
    let inkRetrieved = WAD.div(8)

    await base.transfer(pool.address, debtRepaidInBase) // This would normally be part of a multicall, using ladle.transferToPool
    await ladle.repay(vaultId, owner, inkRetrieved, 0);

    /* await expect(await ladle.repay(vaultId, owner, inkRetrieved, 0))
      .to.emit(cauldron, 'VaultPoured')
      .withArgs(vaultId, seriesId, ilkId, inkRetrieved, debtRepaidInFY.mul(-1))
      .to.emit(pool, 'Trade')
      .withArgs(await fyToken.maturity(), ladle.address, fyToken.address, debtRepaidInBase, debtRepaidInFY.mul(-1)) */
    
    // expect((await cauldron.balances(vaultId)).art).to.equal(WAD.sub(debtRepaidInFY))
    expect(await base.balanceOf(owner)).to.equal(baseBalanceBefore.sub(debtRepaidInBase))

    console.log('repays debt with base in a batch')
    vaultId = ethers.utils.hexlify(ethers.utils.randomBytes(12))
    await ladle.build(vaultId, seriesId, ilkId)
    await ladle.pour(vaultId, owner, inkPosted, baseBorrowed)

    baseBalanceBefore = await base.balanceOf(owner)
    debtRepaidInBase = WAD.div(2)
    // const debtRepaidInFY = debtRepaidInBase.mul(105).div(100)
    inkRetrieved = WAD.div(4)

    await base.approve(ladle.address, debtRepaidInBase) // This would normally be part of a multicall, using ladle.forwardPermit
    await ladle.batch(
      [
        ladle.transferToPoolAction(seriesId, true, debtRepaidInBase),
        ladle.repayAction(vaultId, owner, inkRetrieved, 0)
      ])
    /* await expect(ladle.batch(vaultId, [OPS.TRANSFER_TO_POOL, OPS.REPAY], [transferToPoolData, repayData]))
      .to.emit(cauldron, 'VaultPoured')
      .withArgs(vaultId, seriesId, ilkId, inkRetrieved, debtRepaidInFY.mul(-1))
      .to.emit(pool, 'Trade')
      .withArgs(await fyToken.maturity(), ladle.address, fyToken.address, debtRepaidInBase, debtRepaidInFY.mul(-1)) */
    // expect((await cauldron.balances(vaultId)).art).to.equal(WAD.sub(debtRepaidInFY))
    expect(await base.balanceOf(owner)).to.equal(baseBalanceBefore.sub(debtRepaidInBase))

    console.log('repays all debt of a vault with base')
    vaultId = ethers.utils.hexlify(ethers.utils.randomBytes(12))
    await ladle.build(vaultId, seriesId, ilkId)
    await ladle.pour(vaultId, owner, inkPosted, baseBorrowed)

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

  console.log('repays all debt of a vault with base in a batch')
    vaultId = ethers.utils.hexlify(ethers.utils.randomBytes(12))
    await ladle.build(vaultId, seriesId, ilkId)
    await ladle.pour(vaultId, owner, inkPosted, baseBorrowed)

    baseBalanceBefore = await base.balanceOf(owner)
    baseOffered = WAD.mul(2)
    debtinFY = WAD
    // const debtInBase = debtinFY.mul(100).div(105)
    inkRetrieved = WAD.div(4)

    await base.approve(ladle.address, baseOffered) // This would normally be part of a multicall, using ladle.forwardPermit
    await ladle.batch(
      [
        ladle.transferToPoolAction(seriesId, true, baseOffered),
        ladle.repayVaultAction(vaultId, owner, inkRetrieved, MAX)
      ]
    )
    /* await expect(
      await ladle.batch(
        [OPS.TRANSFER_TO_POOL, OPS.REPAY_VAULT],
        [transferToPoolData, repayVaultData]
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
