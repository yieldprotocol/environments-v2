import { ethers } from 'hardhat'
import { ROOT, contangoWitch_key, contangoCauldron_key, contangoLadle_key } from '../../../../shared/constants'
import { addressHasCode, tenderlyVerify, verify } from '../../../../shared/helpers'
import { ContangoWitch } from '../../../../typechain'
/**
 * @dev This script deploys the Witch
 * The Timelock gets ROOT access.
 */
export const deployContangoWitch = async (
  ownerAcc: any,
  protocol: Map<string, string>,
  governance: Map<string, string>,
  contangoAddress: string
): Promise<ContangoWitch> => {
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  const cauldronAddress = protocol.get(contangoCauldron_key)
  const ladleAddress = protocol.get(contangoLadle_key)

  await addressHasCode(contangoAddress, 'contango')

  let contangoWitch: ContangoWitch

  if (cauldronAddress && ladleAddress) {
    const contangoWitchAddress = protocol.get(contangoWitch_key)
    if (contangoWitchAddress === undefined) {
      contangoWitch = await (
        await ethers.getContractFactory('ContangoWitch')
      ).deploy(contangoAddress, cauldronAddress, ladleAddress)
      await contangoWitch.deployed()
      console.log(`Witch deployed at ${contangoWitch.address}`)
      verify(contangoWitch.address, [contangoAddress, cauldronAddress, ladleAddress])
      tenderlyVerify('ContangoWitch', contangoWitch)
    } else {
      contangoWitch = await ethers.getContractAt('ContangoWitch', contangoWitchAddress, ownerAcc)
      await contangoWitch.auctioneerReward() // Check if the contract is an actual witch
      console.log(`Reusing contangoWitch at: ${contangoWitch.address}`)
    }
  } else throw new Error('contangoCauldron or contangoLadle are not deployed!')

  if (!(await contangoWitch.hasRole(ROOT, timelock.address))) {
    await contangoWitch.grantRole(ROOT, timelock.address)
    console.log(`witch.grantRoles(ROOT, timelock)`)
    while (!(await contangoWitch.hasRole(ROOT, timelock.address))) {}
  }

  return contangoWitch
}
