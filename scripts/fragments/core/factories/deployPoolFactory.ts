import { ethers } from 'hardhat'
import { getOriginalChainId, getOwnerOrImpersonate, verify, readAddressMappingIfExists, writeAddressMap } from '../../../../shared/helpers'
import { ROOT } from '../../../../shared/constants'
import { PoolFactory, Timelock } from '../../../../typechain'

/**
 * @dev This script deploys the PoolFactory
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
  
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let poolFactory: PoolFactory
  if (protocol.get('poolFactory') === undefined) {
    const poolLibs = {
      YieldMath: protocol.get('yieldMath') as string,
      SafeERC20Namer: protocol.get('safeERC20Namer') as string,
    }
    const PoolFactoryFactory = await ethers.getContractFactory('PoolFactory', {
      libraries: poolLibs,
    })
    poolFactory = (await PoolFactoryFactory.deploy()) as unknown as PoolFactory
    await poolFactory.deployed()
    console.log(`PoolFactory deployed at ${poolFactory.address}`)
    verify(poolFactory.address, [], 'safeERC20Namer.js')
    protocol.set('poolFactory', poolFactory.address)
    writeAddressMap('protocol.json', protocol);
  } else {
    poolFactory = (await ethers.getContractAt(
      'PoolFactory',
      protocol.get('poolFactory') as string,
      ownerAcc
    )) as PoolFactory
    console.log(`Reusing PoolFactory at ${poolFactory.address}`)
  }
  if (!(await poolFactory.hasRole(ROOT, timelock.address))) {
    await poolFactory.grantRole(ROOT, timelock.address)
    console.log(`poolFactory.grantRoles(ROOT, timelock)`)
    while (!(await poolFactory.hasRole(ROOT, timelock.address))) {}
  }
})()
