import { ethers, waffle } from 'hardhat'
import { verify, writeAddressMap } from '../../../../shared/helpers'
import { ROOT } from '../../../../shared/constants'
import EmergencyBrakeArtifact from '../../../../artifacts/@yield-protocol/utils-v2/contracts/utils/EmergencyBrake.sol/EmergencyBrake.json'
import { Timelock, EmergencyBrake } from '../../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Cloak
 *
 * It takes as inputs the governance json address file, which is updated.
 */
export const deployCloak = async (
  ownerAcc: any,
  timelock: Timelock,
  governance: Map<string, string>
): Promise<EmergencyBrake> => {
  let cloak: EmergencyBrake
  if (governance.get('cloak') === undefined) {
    cloak = (await deployContract(ownerAcc, EmergencyBrakeArtifact, [
      ownerAcc.address,
      ownerAcc.address,
    ])) as EmergencyBrake // Give the planner and executor their roles once set up
    console.log(`Cloak deployed at ${cloak.address}`)
    verify(cloak.address, [ownerAcc.address, ownerAcc.address]) // Give the planner and executor their roles once set up

    governance.set('cloak', cloak.address)
    writeAddressMap('governance.json', governance)
  } else {
    cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
    console.log(`Reusing Cloak at ${cloak.address}`)
  }
  if (!(await cloak.hasRole(ROOT, timelock.address))) {
    await cloak.grantRole(ROOT, timelock.address)
    console.log(`cloak.grantRoles(ROOT, timelock)`)
    while (!(await cloak.hasRole(ROOT, timelock.address))) {}
  }

  return cloak
}
