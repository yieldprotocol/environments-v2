import { ethers } from 'hardhat'
import { CLOAK, CONTANGO_CAULDRON, CONTANGO_LADLE, CONTANGO_WITCH, TIMELOCK } from '../../../../../shared/constants'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../../shared/helpers'
import { orchestrateContangoLadle } from '../../shared/orchestrateContangoLadle'
import { orchestrateWitchV2 } from '../../../../fragments/core/orchestrateWitch'

const { protocol, governance, developer, auctionLineAndLimits, bases, fyTokens, contangoAddress } = require(process.env
  .CONF as string)

/**
 * @dev This script orchestrates the Cauldron, Ladle, Witch (and Wand?)
 */

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer as string)

  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get(CLOAK) as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get(TIMELOCK) as string, ownerAcc)
  const contangoWitch = await ethers.getContractAt('ContangoWitch', protocol.get(CONTANGO_WITCH) as string, ownerAcc)
  const contangoLadle = await ethers.getContractAt('ContangoLadle', protocol.get(CONTANGO_LADLE) as string, ownerAcc)
  const contangoCauldron = await ethers.getContractAt('Cauldron', protocol.get(CONTANGO_CAULDRON) as string, ownerAcc)

  // Build the proposal
  const proposal = [
    await orchestrateWitchV2(
      ownerAcc,
      contangoWitch,
      cloak,
      timelock,
      contangoCauldron,
      contangoLadle,
      auctionLineAndLimits,
      bases,
      fyTokens
    ),
    await orchestrateContangoLadle(contangoAddress, contangoLadle, cloak),
  ].flat(1)

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
