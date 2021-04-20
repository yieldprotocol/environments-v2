
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { id } from '@yield-protocol/utils'
import { WAD } from '../shared/constants'

import { Join } from '../typechain/Join'
import { ERC20Mock } from '../typechain/ERC20Mock'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'

import { DAI } from '../shared/constants'
import { VaultEnvironment } from '../fixtures/vault'
import { fixture } from '../environments/testing';
const { loadFixture } = waffle

describe('Join', function () {
  this.timeout(0)

  let ownerAcc: SignerWithAddress
  let owner: string
  let otherAcc: SignerWithAddress
  let other: string
  let join: Join
  let joinFromOther: Join
  let token: ERC20Mock

  let env: VaultEnvironment

  it('test all', async () => {
    env = await loadFixture(fixture);

    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()

    otherAcc = signers[1]
    other = await otherAcc.getAddress()

    token = env.assets.get(DAI) as ERC20Mock
    join = env.joins.get(DAI) as Join
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
