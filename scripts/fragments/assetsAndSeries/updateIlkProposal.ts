/**
 * @dev This script establishes one or more base/ilk pairs from existing bases and ilks.
 */

import { bytesToBytes32 } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'

import { IOracle, Cauldron } from '../../../typechain'

export const updateIlkProposal = async (
  spotOracle: IOracle,
  cauldron: Cauldron,
  debtLimits: Array<[string, string, number, number, number, number]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let [baseId, ilkId, ratio, line, dust, dec] of debtLimits) {
    // This step in the proposal ensures that the source has been added to the oracle, `peek` will fail with 'Source not found' if not
    // console.log(`Adding for ${getName(baseId)}/${getName(ilkId)} from ${spotOracle.address as string}`)
    proposal.push({
      target: spotOracle.address,
      data: spotOracle.interface.encodeFunctionData('peek', [bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD]),
    })

    // Set the spot oracle in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setSpotOracle', [baseId, ilkId, spotOracle.address, ratio]),
    })

    // Set the base/ilk limits in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setDebtLimits', [baseId, ilkId, line, dust, dec]),
    })
  }

  return proposal
}
