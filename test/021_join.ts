
import *  as fs from 'fs'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { id } from '@yield-protocol/utils-v2'
import { WAD } from '../shared/constants'

import { Join } from '../typechain/Join'
import { ERC20Mock } from '../typechain/ERC20Mock'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'
import { jsonToMap } from '../shared/helpers'

import { DAI } from '../shared/constants'

describe('Join', function () {
  this.timeout(0)

  let ownerAcc: SignerWithAddress
  let owner: string
  let otherAcc: SignerWithAddress
  let other: string
  let join: Join
  let joinFromOther: Join
  let token: ERC20Mock

  it('test all', async () => {
    const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string, string>;
    const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string, string>;

    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()

    otherAcc = signers[1]
    other = await otherAcc.getAddress()

    token = await ethers.getContractAt('ERC20Mock', assets.get(DAI) as string, ownerAcc) as ERC20Mock
    join = await ethers.getContractAt('Join', joins.get(DAI) as string, ownerAcc) as Join
    joinFromOther = join.connect(otherAcc)

    await join.grantRoles([id('join(address,uint128)'), id('exit(address,uint128)')], owner)

    await token.mint(owner, WAD.mul(4))

    console.log('pulls tokens from user')
    let storedBalanceBefore = await join.storedBalance()
    await token.approve(join.address, WAD)
    expect(await join.join(owner, WAD))
      .to.emit(token, 'Transfer')
      .withArgs(owner, join.address, WAD)
    expect(await join.storedBalance()).to.equal(storedBalanceBefore.add(WAD))

    console.log('accepts surplus as a transfer')
    storedBalanceBefore = await join.storedBalance()
    await token.transfer(join.address, WAD)
    expect(await join.join(owner, WAD)).to.not.emit(token, 'Transfer')
    expect(await join.storedBalance()).to.equal(storedBalanceBefore.add(WAD))

    console.log('combines surplus and tokens pulled from the user')
    storedBalanceBefore = await join.storedBalance()
    await token.transfer(join.address, WAD)
    await token.approve(join.address, WAD)
    expect(await join.join(owner, WAD.mul(2)))
      .to.emit(token, 'Transfer')
      .withArgs(owner, join.address, WAD)
    expect(await join.storedBalance()).to.equal(storedBalanceBefore.add(WAD.mul(2)))

    console.log('pushes tokens to user')
    storedBalanceBefore = await join.storedBalance()
    expect(await join.exit(owner, WAD))
      .to.emit(token, 'Transfer')
      .withArgs(join.address, owner, WAD)
    expect(await join.storedBalance()).to.equal(storedBalanceBefore.sub(WAD))
  })  
})
