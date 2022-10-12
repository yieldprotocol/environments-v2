import { ethers } from 'hardhat'
import { ROOT } from '../../../shared/constants'
import { tenderlyVerify, verify } from '../../../shared/helpers'
import { Cauldron, Witch, Ladle, Timelock } from '../../../typechain'
/**
 * @dev This script deploys the Witch
 * The Timelock gets ROOT access.
 */
export const deployWitch = async (
  ownerAcc: any,
  timelock: Timelock,
  cauldron: Cauldron,
  ladle: Ladle
): Promise<Witch> => {
  let witch: Witch

  witch = await (await ethers.getContractFactory('Witch')).deploy(cauldron.address, ladle.address)
  await witch.deployed()
  console.log(`Witch deployed at ${witch.address}`)
  verify(witch.address, [cauldron.address, ladle.address])
  tenderlyVerify('Witch', witch)

  if (!(await witch.hasRole(ROOT, timelock.address))) {
    await (await witch.grantRole(ROOT, timelock.address)).wait()
    console.log(`witch.grantRoles(ROOT, timelock)`)
  }

  return witch
}
