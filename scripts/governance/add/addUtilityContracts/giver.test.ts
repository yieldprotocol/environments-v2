import { ethers } from 'hardhat'

import { getOwnerOrImpersonate } from '../../../../shared/helpers'
import { Giver } from '../../../../typechain'

import { WAD } from '../../../../shared/constants'
const { developer } = require(process.env.CONF as string)
const { protocol,governance } = require(process.env.CONF as string)
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'

/**
 * @dev This script tests the giver contract
 */

describe('Giver', function () {
  let giver: Giver
  let ownerAcc: SignerWithAddress
  let vaultOwnerAcc: SignerWithAddress
  let timelock: SignerWithAddress
  const DUMMYADDRESS = '0x80d9BC4B2B21C69ba2B7ED92882fF79069Ea7e13'
  const VAULTOWNER = '0xc1ba0df9e937831496e58d02edefb4339d2572da'

  before(async () => {
    ownerAcc = await getOwnerOrImpersonate(developer, WAD)
    vaultOwnerAcc = await getOwnerOrImpersonate(VAULTOWNER, WAD)
    timelock = await getOwnerOrImpersonate(governance.get('timelock') as string, WAD)
    giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as unknown as Giver
  })

  it('Cannot give a vault of blacklisted asset', async () => {
    await giver.connect(vaultOwnerAcc).give('0x69c346bcd85a55add79c4feb', DUMMYADDRESS)
  })
  it('Blacklist an asset', async () => {
      await giver.connect(timelock).blacklistIlk('0x303100000000')
  })
  it('Can give a vault of asset which is not blacklisted', async () => {})
  it('Can give a vault belonging to a user', async () => {})
  it('Cannot give a vault that doesnt belong to the user', async () => {
    await expect(giver.give('0x69c346bcd85a55add79c4feb', DUMMYADDRESS)).to.be.revertedWith(
      'msg.sender is not the owner'
    )
  })
})
