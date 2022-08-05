/**
 * @dev This script updates the collateralization ratio used for one or more asset pairs in the Cauldron.
 */

import { ZERO_ADDRESS } from '../../../shared/constants'

import { Cauldron } from '../../../typechain'

export const updateRatioProposal = async (
  ownerAcc: any,
  cauldron: Cauldron,
  ratios: Array<[string, string, number]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let [baseId, ilkId, ratio] of ratios) {
    const spotOracle = (await cauldron.spotOracles(baseId, ilkId)).oracle

    if (spotOracle === ZERO_ADDRESS) {
      throw Error(`Spot oracle for ${baseId}/${ilkId} not set in Cauldron`)
    }

    // Set the spot oracle in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setSpotOracle', [baseId, ilkId, spotOracle, ratio]),
    })
    console.log(`Collateralization ratio for ${baseId}/${ilkId} set to ${ratio}`)
  }

  return proposal
}
