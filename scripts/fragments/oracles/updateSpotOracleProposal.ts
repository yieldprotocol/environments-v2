/**
 * @dev This script updates the spot oracle used for one or more asset pairs in the Cauldron.
 */

import { ethers } from 'hardhat'
import { bytesToBytes32 } from '../../../shared/helpers'
import { WAD, ZERO_ADDRESS } from '../../../shared/constants'

import { IOracle, Cauldron } from '../../../typechain'

export const updateSpotOracleProposal = async (
  ownerAcc: any,
  cauldron: Cauldron,
  assetPairs: Array<[string, string, string]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let [baseId, ilkId, spotOracleAddress] of assetPairs) {
    const spotOracle = (await ethers.getContractAt('IOracle', spotOracleAddress, ownerAcc)) as unknown as IOracle

    // This step in the proposal ensures that the source has been added to the oracle, `peek` will fail with 'Source not found' if not
    // console.log(`Adding for ${bytesToString(baseId)}/${bytesToString(ilkId)} from ${spotOracle.address as string}`)
    proposal.push({
      target: spotOracle.address,
      data: spotOracle.interface.encodeFunctionData('peek', [bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD]),
    })

    // Check the pair already exists in the Cauldron
    if ((await cauldron.spotOracles(baseId, ilkId)).oracle === ZERO_ADDRESS) {
      throw Error(`Spot oracle for ${baseId}/${ilkId} not set in Cauldron`)
    }

    // Set the spot oracle in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setSpotOracle', [
        baseId,
        ilkId,
        spotOracle.address,
        (await cauldron.spotOracles(baseId, ilkId)).ratio,
      ]),
    })
    console.log(`Spot oracle for ${baseId}/${ilkId} set to ${spotOracleAddress}`)
  }

  return proposal
}
