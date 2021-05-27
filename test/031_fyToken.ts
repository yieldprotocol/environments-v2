import *  as fs from 'fs'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { id } from '@yield-protocol/utils-v2'
import { CHI, WAD, DAI, USDC, WBTC } from '../shared/constants'
import { seriesData } from '../environments/config'
import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Join } from '../typechain/Join'
import { FYToken } from '../typechain/FYToken'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { ISourceMock } from '../typechain/ISourceMock'
import { LadleWrapper } from '../shared/ladleWrapper'
import { jsonToMap } from '../shared/helpers'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'


describe('FYToken', function () {
  this.timeout(0)

  let ownerAcc: SignerWithAddress
  let owner: string
  let fyToken: FYToken
  let base: ERC20Mock
  let baseJoin: Join
  let ilk: ERC20Mock
  let ilkJoin: Join
  let chiOracle: CompoundMultiOracle
  let chiSource: ISourceMock
  let innerLadle: Ladle
  let ladle: LadleWrapper

  let vaultId = ethers.utils.hexlify(ethers.utils.randomBytes(12))
  let seriesId = seriesData[0][0]
  let baseId = DAI
  let ilkId = WBTC

  it('test all', async () => {

    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()

    const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string, string>;
    const chiSources = jsonToMap(fs.readFileSync('./output/chiSources.json', 'utf8')) as Map<string, string>;
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
    const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string, string>;
    const fyTokens = jsonToMap(fs.readFileSync('./output/fyTokens.json', 'utf8')) as Map<string, string>;

    innerLadle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as Ladle
    ladle = new LadleWrapper(innerLadle)
    base = await ethers.getContractAt('ERC20Mock', assets.get(baseId) as string, ownerAcc) as ERC20Mock
    baseJoin = await ethers.getContractAt('Join', joins.get(baseId) as string, ownerAcc) as Join
    ilk = await ethers.getContractAt('ERC20Mock', assets.get(ilkId) as string, ownerAcc) as ERC20Mock
    ilkJoin = await ethers.getContractAt('Join', joins.get(ilkId) as string, ownerAcc) as Join
    seriesId = fyTokens.keys().next().value as string
    fyToken = await ethers.getContractAt('FYToken', fyTokens.get(seriesId) as string, ownerAcc) as FYToken
    chiOracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as CompoundMultiOracle
    chiSource = await ethers.getContractAt('ISourceMock', chiSources.get(baseId) as string, ownerAcc) as ISourceMock

    // await baseJoin.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], fyToken.address)
    // await fyToken.grantRoles([id('mint(address,uint256)'), id('burn(address,uint256)')], owner)

    await ladle.build(vaultId, seriesId, ilkId)

    // Borrow fyToken
    await ilk.approve(ilkJoin.address, WAD.mul(6))
    await ladle.pour(vaultId, owner, WAD.mul(2), WAD)

    // Load the base join to serve redemptions
    await base.approve(baseJoin.address, WAD.mul(2))
    await baseJoin.grantRoles([id('join(address,uint128)')], owner)
    await baseJoin.join(owner, WAD.mul(2))

    // it('does not allow to mature before maturity', async () => {
    await expect(fyToken.mature()).to.be.revertedWith('Only after maturity')

    // it('does not allow to redeem before maturity', async () => {
    await expect(fyToken.redeem(owner, WAD)).to.be.revertedWith('Only after maturity')

    // describe('after maturity', async () => {
    await ethers.provider.send('evm_mine', [(await fyToken.maturity()).toNumber()])

    // it('does not allow to mint after maturity', async () => {
    await expect(ladle.pour(vaultId, owner, WAD.mul(2), WAD)).to.be.reverted

    // it('matures by recording the chi value', async () => {
    expect(await fyToken.mature())
      .to.emit(fyToken, 'SeriesMatured')
      .withArgs(WAD)

    // it('does not allow to mature more than once', async () => {
    await expect(fyToken.mature()).to.be.revertedWith('Already matured')
    

    // describe('once matured', async () => {
    const accrual = WAD.mul(110).div(100) // accrual is 10%

    // it('redeems fyToken for underlying according to the chi accrual', async () => {
    await chiSource.set(accrual) // Since spot was 1 when recorded at maturity, accrual is equal to the current spot
    
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
