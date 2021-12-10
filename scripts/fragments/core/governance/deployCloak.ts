import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, getOwnerOrImpersonate, verify, writeAddressMap, readAddressMappingIfExists } from '../../../../shared/helpers'
import { ROOT } from '../../../../shared/constants'
import EmergencyBrakeArtifact from '../../../../artifacts/@yield-protocol/utils-v2/contracts/utils/EmergencyBrake.sol/EmergencyBrake.json'
import { Timelock, EmergencyBrake } from '../../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Cloak
 *
 * It takes as inputs the governance json address file, which is updated.
 */

;(async () => {
  const chainId = await getOriginalChainId()

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const governance = readAddressMappingIfExists('governance.json');

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  
  let cloak: EmergencyBrake
  if (governance.get('cloak') === undefined) {
    cloak = (await deployContract(ownerAcc, EmergencyBrakeArtifact, [
      ownerAcc.address,
      ownerAcc.address,
    ])) as EmergencyBrake // Give the planner and executor their roles once set up
    console.log(`Cloak deployed at ${cloak.address}`)
    verify(cloak.address, [ownerAcc.address, ownerAcc.address]) // Give the planner and executor their roles once set up

    governance.set('cloak', cloak.address)
    writeAddressMap('governance.json', governance);
  } else {
    cloak = (await ethers.getContractAt(
      'EmergencyBrake',
      governance.get('cloak') as string,
      ownerAcc
    )) as unknown as EmergencyBrake
    console.log(`Reusing Cloak at ${cloak.address}`)
  }
  if (!(await cloak.hasRole(ROOT, timelock.address))) {
    await cloak.grantRole(ROOT, timelock.address)
    console.log(`cloak.grantRoles(ROOT, timelock)`)
    while (!(await cloak.hasRole(ROOT, timelock.address))) {}
  }
})()
