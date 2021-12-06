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
 
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

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

  let witch: Witch
  if (protocol.get('witch') === undefined) {
    witch = (await deployContract(ownerAcc, WitchArtifact, [
      protocol.get('cauldron') as string,
      protocol.get('ladle') as string,
    ])) as Witch
    console.log(`[Witch, '${witch.address}'],`)
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
})()
