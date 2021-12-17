import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, getOwnerOrImpersonate, verify, readAddressMappingIfExists, writeAddressMap } from '../../../../shared/helpers'
import { ROOT } from '../../../../shared/constants'
import JoinFactoryArtifact from '../../../../artifacts/@yield-protocol/vault-v2/contracts/JoinFactory.sol/JoinFactory.json'
import { JoinFactory, Timelock } from '../../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the JoinFactory
 * The Timelock gets ROOT access.
 */

;(async () => {
  const chainId = await getOriginalChainId()

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
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

  let joinFactory: JoinFactory
  if (protocol.get('joinFactory') === undefined) {
    joinFactory = (await deployContract(ownerAcc, JoinFactoryArtifact, [])) as JoinFactory
    console.log(`JoinFactory deployed at ${joinFactory.address}`)
    verify(joinFactory.address, [])
    protocol.set('joinFactory', joinFactory.address)
    writeAddressMap('protocol.json', protocol);
  } else {
    joinFactory = (await ethers.getContractAt(
      'JoinFactory',
      protocol.get('joinFactory') as string,
      ownerAcc
    )) as JoinFactory
    console.log(`Reusing JoinFactory at ${joinFactory.address}`)
  }

  if (!(await joinFactory.hasRole(ROOT, timelock.address))) {
    await joinFactory.grantRole(ROOT, timelock.address)
    console.log(`joinFactory.grantRoles(ROOT, timelock)`)
    while (!(await joinFactory.hasRole(ROOT, timelock.address))) {}
  }
})()
