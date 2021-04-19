import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { id } from '@yield-protocol/utils'
import { WAD, DEC6 } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { Join } from '../typechain/Join'
import { FYToken } from '../typechain/FYToken'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { OracleMock } from '../typechain/OracleMock'
import { Ladle } from '../typechain/Ladle'

import { ethers } from 'hardhat'
import { expect } from 'chai'

describe('FYToken', function () {
  this.timeout(0)
  let clean: Number

  let ownerAcc: SignerWithAddress
  let owner: string
  let cauldron: Cauldron
  let fyToken: FYToken
  let base: ERC20Mock
  let baseJoin: Join
  let chiOracle: OracleMock
  let ladle: Ladle

  let vaultId = ethers.utils.hexlify(ethers.utils.randomBytes(12))
  let seriesId = '0xfb1109617c0e'
  let ilkId = '0x555344430000'

  it('test all', async () => {
    clean = await ethers.provider.send('evm_snapshot', [])

    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()

    cauldron = (await ethers.getContractAt('Cauldron', '0x5FbDB2315678afecb367f032d93F642f64180aa3')) as Cauldron
    ladle = (await ethers.getContractAt('Ladle', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')) as Ladle
    base = (await ethers.getContractAt('ERC20Mock', '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1')) as ERC20Mock
    baseJoin = (await ethers.getContractAt('Join', '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c')) as Join
    fyToken = (await ethers.getContractAt('FYToken', '0x162A433068F51e18b7d13932F27e66a3f99E6890')) as FYToken
    chiOracle = (await ethers.getContractAt('OracleMock', '0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575')) as OracleMock // chi oracle

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


    // it('does not allow to redeem before chi is recorded', async () => {
    await expect(fyToken.redeem(owner, WAD)).to.be.revertedWith('No recorded spot')

    // it('matures by recording the chi value', async () => {
    const maturity = await fyToken.maturity()
      expect(await fyToken.mature())
        .to.emit(chiOracle, 'Recorded')
        .withArgs(maturity, DEC6)

    // it('does not allow to mature more than once', async () => {
    await expect(fyToken.mature()).to.be.revertedWith('Already recorded a value')
    

    // describe('once matured', async () => {
    const accrual = DEC6.mul(110).div(100) // accrual is 10%

    // it('redeems fyToken for underlying according to the chi accrual', async () => {
    await chiOracle.setSpot(accrual) // Since spot was 1 when recorded at maturity, accrual is equal to the current spot
    
    const baseOwnerBefore = await base.balanceOf(owner)
    const baseJoinBefore = await base.balanceOf(baseJoin.address)
    await expect(fyToken.redeem(owner, WAD))
      .to.emit(fyToken, 'Redeemed')
      .withArgs(owner, owner, WAD, WAD.mul(accrual).div(DEC6))
    expect(await base.balanceOf(baseJoin.address)).to.equal(baseJoinBefore.sub(WAD.mul(accrual).div(DEC6)))
    expect(await base.balanceOf(owner)).to.equal(baseOwnerBefore.add(WAD.mul(accrual).div(DEC6)))
    expect(await fyToken.balanceOf(owner)).to.equal(0)
    
    await ethers.provider.send('evm_revert', [clean])
  })
})
