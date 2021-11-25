import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, getOwnerOrImpersonate, verify, readAddressMappingIfExists, writeAddressMap } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import WandArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/Wand.sol/Wand.json'

import { Wand } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Wand
 * The Timelock gets ROOT access.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw 'Only Kovan and Mainnet supported'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const timelock = governance.get('timelock') as string

  let wand: Wand
  if (protocol.get('wand') === undefined) {
    wand = (await deployContract(ownerAcc, WandArtifact, [
      protocol.get('cauldron') as string,
      protocol.get('ladle') as string,
      protocol.get('witch') as string,
      protocol.get('poolFactory') as string,
      protocol.get('joinFactory') as string,
      protocol.get('fyTokenFactory') as string,
    ])) as Wand
    console.log(`[Wand, '${wand.address}'],`)
    verify(wand.address, [
      protocol.get('cauldron') as string,
      protocol.get('ladle') as string,
      protocol.get('witch') as string,
      protocol.get('poolFactory') as string,
      protocol.get('joinFactory') as string,
      protocol.get('fyTokenFactory') as string,
    ])

    protocol.set('wand', wand.address)
    writeAddressMap('protocol.json', protocol);
  } else {
    wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as Wand
  }
  if (!(await wand.hasRole(ROOT, timelock))) {
    await wand.grantRole(ROOT, timelock)
    console.log(`wand.grantRoles(ROOT, timelock)`)
    while (!(await wand.hasRole(ROOT, timelock))) {}
  }
})()
