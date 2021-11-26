import { ethers } from 'hardhat'
import { getOriginalChainId, getOwnerOrImpersonate, verify, readAddressMappingIfExists, writeAddressMap } from '../../../../shared/helpers'
import { ROOT } from '../../../../shared/constants'
import { FYTokenFactory, Timelock } from '../../../../typechain'


/**
 * @dev This script deploys the FYTokenFactory
 * The Timelock and Cloak get ROOT access.
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

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let fyTokenFactory: FYTokenFactory
  if (protocol.get('fyTokenFactory') === undefined) {
    const fyTokenFactoryFactory = await ethers.getContractFactory('FYTokenFactory', {
      libraries: {
        SafeERC20Namer: protocol.get('safeERC20Namer') as string,
      },
    })
    fyTokenFactory = (await fyTokenFactoryFactory.deploy()) as unknown as FYTokenFactory
    await fyTokenFactory.deployed()
    console.log(`FYTokenFactory deployed at ${fyTokenFactory.address}`)
    verify(fyTokenFactory.address, [], 'safeERC20Namer.js')
    protocol.set('fyTokenFactory', fyTokenFactory.address)
    
    writeAddressMap('protocol.json', protocol);
  } else {
    fyTokenFactory = (await ethers.getContractAt(
      'FYTokenFactory',
      protocol.get('fyTokenFactory') as string,
      ownerAcc
    )) as FYTokenFactory
    console.log(`Reusing FYTokenFactory at ${fyTokenFactory.address}`)
  }

  if (!(await fyTokenFactory.hasRole(ROOT, timelock.address))) {
    await fyTokenFactory.grantRole(ROOT, timelock.address)
    console.log(`fyTokenFactory.grantRoles(ROOT, timelock)`)
    while (!(await fyTokenFactory.hasRole(ROOT, timelock.address))) {}
  }
})()
