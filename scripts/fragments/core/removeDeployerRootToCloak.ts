/**
 * @dev This script adds one or more assets to the protocol.
 *
 * It takes as inputs the governance, protocol, assets and joins json address files.
 * It uses the Wand to:
 *  - Add the asset to Cauldron.
 *  - Deploy a new Join, which gets added to the Ladle, which gets permissions to join and exit.
 * The Timelock and Cloak get ROOT access to the new Join. Root access is NOT removed from the Wand.
 * The Timelock gets access to governance functions in the new Join.
 * A plan is recorded in the Cloak to isolate the Join from the Ladle.
 * It adds to the assets and joins json address files.
 * @notice The assetIds can't be already in use
 */

import { ROOT } from '../../../shared/constants'

import { EmergencyBrake, AccessControl } from '../../../typechain'
const { deployers } = require(process.env.CONF as string)

export const removeDeployerRootToCloak = async (
  deployer: string,
  cloak: EmergencyBrake,
  target: AccessControl
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  deployer = deployers.get(target.address)
  if (await target.hasRole(ROOT, deployer)) {
    proposal.push({
      target: target.address,
      data: target.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
    })
    console.log(`revokeRole(ROOT, deployer)`)
  }

  if (!(await target.hasRole(ROOT, cloak.address))) {
    proposal.push({
      target: target.address,
      data: target.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
    })
    console.log(`join.grantRole(ROOT, cloak)`)
  }

  return proposal
}
