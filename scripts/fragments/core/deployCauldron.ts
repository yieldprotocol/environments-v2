import { ethers, waffle } from 'hardhat'
import { verify, writeAddressMap } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import CauldronArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/Cauldron.sol/Cauldron.json'

import { Cauldron } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Cauldron
 * The Timelock gets ROOT access.
 */
export const deployCauldron = async (
  ownerAcc: any,
  protocol: Map<string, string>,
  governance: Map<string, string>
): Promise<Cauldron> => {
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  let cauldron: Cauldron
  if (protocol.get('cauldron') === undefined) {
    cauldron = (await deployContract(ownerAcc, CauldronArtifact, [])) as Cauldron
    console.log(`Cauldron deployed at ${cauldron.address}`)
    verify(cauldron.address, [])
    protocol.set('cauldron', cauldron.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
    console.log(`Reusing Cauldron at ${cauldron.address}`)
  }
  if (!(await cauldron.hasRole(ROOT, timelock.address))) {
    await cauldron.grantRole(ROOT, timelock.address)
    console.log(`cauldron.grantRoles(ROOT, timelock)`)
    while (!(await cauldron.hasRole(ROOT, timelock.address))) {}
  }

  return cauldron
}
