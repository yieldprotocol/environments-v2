import { ethers } from 'hardhat'
import { CONTANGO_CAULDRON, CONTANGO_LADLE, CONTANGO_WITCH } from '../../../../../shared/constants'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../../shared/helpers'
import { orchestrateWitchV2 } from '../../../../fragments/core/orchestrateWitchV2Proposal'
import { replaceWitchV2 } from '../../../../fragments/replace/replaceWitchV2'

const { protocol, governance, developer, auctionLineAndLimits, bases, fyTokens } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the Cauldron, Ladle, Witch (and Wand?)
 */

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer as string)

  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  const contangoWitch = await ethers.getContractAt('ContangoWitch', protocol.get(CONTANGO_WITCH) as string, ownerAcc)
  const contangoLadle = await ethers.getContractAt('ContangoLadle', protocol.get(CONTANGO_LADLE) as string, ownerAcc)
  const contangoCauldron = await ethers.getContractAt('Cauldron', protocol.get(CONTANGO_CAULDRON) as string, ownerAcc)

  const badWitch = await ethers.getContractAt('ContangoWitch', '0x79857da1d4b976f40787daa6177E24256bc53b75', ownerAcc)

  // Build the proposal
  const proposal = [
    await replaceWitchV2(ownerAcc, badWitch, contangoCauldron, contangoLadle, auctionLineAndLimits, bases, fyTokens),
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
  ].flat(1)

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
