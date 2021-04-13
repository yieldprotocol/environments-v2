
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { id } from '@yield-protocol/utils'
import { WAD } from '../shared/constants'

import { Join } from '../typechain/Join'
import { ERC20Mock } from '../typechain/ERC20Mock'

import { ethers } from 'hardhat'
import { expect } from 'chai'
describe('Join', function () {
  this.timeout(0)
  let clean: Number

  let ownerAcc: SignerWithAddress
  let owner: string
  let otherAcc: SignerWithAddress
  let other: string
  let join: Join
  let joinFromOther: Join
  let token: ERC20Mock

  it('the test', async () => {
    clean = await ethers.provider.send('evm_snapshot', [])

    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()

    otherAcc = signers[1]
    other = await otherAcc.getAddress()

    token = (await ethers.getContractAt('ERC20Mock', '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1')) as ERC20Mock
    join = (await ethers.getContractAt('Join', '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c')) as Join
    joinFromOther = join.connect(otherAcc)

    await join.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], owner)

    await token.mint(owner, WAD.mul(4))

    // it('pulls tokens from user', async () => {
    let storedBalanceBefore = await join.storedBalance()
    await token.approve(join.address, WAD)
    expect(await join.join(owner, WAD))
      .to.emit(token, 'Transfer')
      .withArgs(owner, join.address, WAD)
    expect(await join.storedBalance()).to.equal(storedBalanceBefore.add(WAD))

    // it('accepts surplus as a transfer', async () => {
    storedBalanceBefore = await join.storedBalance()
    await token.transfer(join.address, WAD)
    expect(await join.join(owner, WAD)).to.not.emit(token, 'Transfer')
    expect(await join.storedBalance()).to.equal(storedBalanceBefore.add(WAD))

    // it('combines surplus and tokens pulled from the user', async () => {
    storedBalanceBefore = await join.storedBalance()
    await token.transfer(join.address, WAD)
    await token.approve(join.address, WAD)
    expect(await join.join(owner, WAD.mul(2)))
      .to.emit(token, 'Transfer')
      .withArgs(owner, join.address, WAD)
    expect(await join.storedBalance()).to.equal(storedBalanceBefore.add(WAD.mul(2)))

    // it('pushes tokens to user', async () => {
    storedBalanceBefore = await join.storedBalance()
    expect(await join.exit(owner, WAD))
      .to.emit(token, 'Transfer')
      .withArgs(join.address, owner, WAD)
    expect(await join.storedBalance()).to.equal(storedBalanceBefore.sub(WAD))
  })  
})
