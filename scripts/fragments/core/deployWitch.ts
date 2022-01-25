 import { ethers, waffle } from 'hardhat'
 import { getOriginalChainId, getOwnerOrImpersonate, verify, readAddressMappingIfExists, writeAddressMap } from '../../../shared/helpers'
 import { ROOT } from '../../../shared/constants'
 
 import WitchArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/Witch.sol/Witch.json'
 
 import { Witch, Timelock } from '../../../typechain'
 
 const { deployContract } = waffle
 
/**
 * @dev This script deploys the Witch
 * The Timelock gets ROOT access.
 */
export const deployWitch = async (
  ownerAcc: any,
  protocol: Map<string, string>,
  governance: Map<string, string>,
): Promise<Witch> => {
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let witch: Witch
  if (protocol.get('witch') === undefined) {
    witch = (await deployContract(ownerAcc, WitchArtifact, [
      protocol.get('cauldron') as string,
      protocol.get('ladle') as string,
    ])) as Witch
    console.log(`Witch deployed at ${witch.address}`)
    verify(witch.address, [
      protocol.get('cauldron') as string,
      protocol.get('ladle') as string,
    ])
    protocol.set('witch', witch.address)
    writeAddressMap('protocol.json', protocol);
  } else {
    witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as Witch
  }
  if (!(await witch.hasRole(ROOT, timelock.address))) {
    await witch.grantRole(ROOT, timelock.address)
    console.log(`witch.grantRoles(ROOT, timelock)`)
    while (!(await witch.hasRole(ROOT, timelock.address))) {}
  }

  return witch
}
