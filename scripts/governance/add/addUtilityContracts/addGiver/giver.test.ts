import { ethers } from 'hardhat'

import { getOwnerOrImpersonate } from '../../../../shared/helpers'
import { Cauldron, Giver } from '../../../../typechain'

import { DAI, WAD } from '../../../../shared/constants'
const { developer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { banIlk } from './banIlk'

/**
 * @dev This script tests the giver contract
 */

describe('Giver', function () {
  let giver: Giver
  let ownerAcc: SignerWithAddress
  let vaultOwnerAcc: SignerWithAddress
  let secondVaultOwnerAcc: SignerWithAddress
  let timelock: SignerWithAddress
  let cauldron: Cauldron
  const DUMMYADDRESS = '0x80d9BC4B2B21C69ba2B7ED92882fF79069Ea7e13'
  const VAULTOWNER = '0xc1ba0df9e937831496e58d02edefb4339d2572da'
  const SECONDVAULT = '0x82b8de30531421cf7ccda448'
  const SECONDVAULTOWNER = '0x383f42b5de515c564641f65f5da3bd8b4a35b4b4'
  before(async () => {
    ownerAcc = await getOwnerOrImpersonate(developer, WAD)
    vaultOwnerAcc = await getOwnerOrImpersonate(VAULTOWNER, WAD)
    secondVaultOwnerAcc = await getOwnerOrImpersonate(SECONDVAULTOWNER, WAD)
    timelock = await getOwnerOrImpersonate(governance.get('timelock') as string, WAD)
    giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as unknown as Giver

    cauldron = (await ethers.getContractAt(
      'Cauldron',
      protocol.get('cauldron') as string,
      ownerAcc
    )) as unknown as Cauldron
  })

  it('Can give a vault of asset which is not blacklisted', async () => {
    expect(await giver.ilkBlacklist(DAI)).to.be.false
    await giver.connect(vaultOwnerAcc).give('0x69c346bcd85a55add79c4feb', DUMMYADDRESS)
    const vaultData = await cauldron.vaults('0x69c346bcd85a55add79c4feb')
    expect(vaultData['owner']).to.not.eq(vaultOwnerAcc.address)
  })

  it('Blacklist an asset', async () => {
    await banIlk()
    await banIlk()
    await banIlk()
    expect(await giver.ilkBlacklist(DAI)).to.be.true
  })

  it('Cannot give a vault of blacklisted asset', async () => {
    await expect(giver.connect(secondVaultOwnerAcc).give(SECONDVAULT, DUMMYADDRESS)).to.be.revertedWith(
      'ilk is blacklisted'
    )
  })

  it('Cannot give a vault that doesnt belong to the user', async () => {
    await expect(giver.give('0x69c346bcd85a55add79c4feb', DUMMYADDRESS)).to.be.revertedWith(
      'msg.sender is not the owner'
    )
  })
})
