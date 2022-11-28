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

import { ethers } from 'hardhat'
import { ROOT } from '../../../shared/constants'

import { Ladle, Join, Timelock, EmergencyBrake } from '../../../typechain'

export const orchestrateJoinProposal = async (
  ownerAcc: any,
  deployer: string,
  cloak: EmergencyBrake,
  assets: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the Join governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, Timelock already has ROOT as the deployer
  // Store a plan for isolating Join from Ladle and Witch
  let proposal: Array<{ target: string; data: string }> = []

  for (let [assetId, , joinAddress] of assets) {
    const join = (await ethers.getContractAt('Join', joinAddress, ownerAcc)) as Join
    await join.asset() // Check it's a valid join

    if (await join.hasRole(ROOT, deployer)) {
      proposal.push({
        target: join.address,
        data: join.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
      })
      console.log(`join.revokeRole(ROOT, deployer)`)
    }

    if (!(await join.hasRole(ROOT, cloak.address))) {
      proposal.push({
        target: join.address,
        data: join.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
      })
      console.log(`join.grantRole(ROOT, cloak)`)
    }
  }

  return proposal
}
