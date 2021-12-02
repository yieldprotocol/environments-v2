import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, getOwnerOrImpersonate, verify, readAddressMappingIfExists, writeAddressMap } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import CauldronArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/Cauldron.sol/Cauldron.json'

import { Cauldron, Timelock } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Cauldron
 * The Timelock gets ROOT access.
 */

;(async () => {
  const chainId = await getOriginalChainId()

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let cauldron: Cauldron
  if (protocol.get('cauldron') === undefined) {
    cauldron = (await deployContract(ownerAcc, CauldronArtifact, [])) as Cauldron
    console.log(`Cauldron deployed at ${cauldron.address}`)
    verify(cauldron.address, [])
    protocol.set('cauldron', cauldron.address)
    writeAddressMap('protocol.json', protocol);
  } else {
    cauldron = (await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)) as Cauldron
    console.log(`Reusing Cauldron at ${cauldron.address}`)
  }
  if (!(await cauldron.hasRole(ROOT, timelock.address))) {
    await cauldron.grantRole(ROOT, timelock.address)
    console.log(`cauldron.grantRoles(ROOT, timelock)`)
    while (!(await cauldron.hasRole(ROOT, timelock.address))) {}
  }
})()
