import { ethers, network } from 'hardhat'
import { contangoCauldron_key, ROOT } from '../../../../shared/constants'
import { tenderlyVerify, verify, writeAddressMap } from '../../../../shared/helpers'
import { Cauldron } from '../../../../typechain'
const hre = require('hardhat')
/**
 * @dev This script deploys the Contango Cauldron instance
 * The Timelock gets ROOT access.
 */
export const deployContangoCauldron = async (
  ownerAcc: any,
  protocol: Map<string, string>,
  governance: Map<string, string>
): Promise<Cauldron> => {
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  const address = protocol.get(contangoCauldron_key)

  let cauldron: Cauldron
  if (address === undefined) {
    cauldron = await (await ethers.getContractFactory('Cauldron')).deploy()
    await cauldron.deployed()
    console.log(`Cauldron deployed at ${cauldron.address}`)
    verify(cauldron.address, [])
    tenderlyVerify('Cauldron', cauldron)
  } else {
    cauldron = await ethers.getContractAt('Cauldron', address, ownerAcc)
    console.log(`Reusing Cauldron at ${cauldron.address}`)
  }
  if (!(await cauldron.hasRole(ROOT, timelock.address))) {
    await cauldron.grantRole(ROOT, timelock.address)
    console.log(`cauldron.grantRoles(ROOT, timelock)`)
    while (!(await cauldron.hasRole(ROOT, timelock.address))) {}
  }

  return cauldron
}
