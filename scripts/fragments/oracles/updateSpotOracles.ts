import { Cauldron } from '../../../typechain'

export const updateSpotOracles = async (
  cauldron: Cauldron,
  spotOracles: Array<[string, string, string, number]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let [baseId, ilkId, oracleAddress, ratio] of spotOracles) {
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setSpotOracle', [baseId, ilkId, oracleAddress, ratio]),
    })
    console.log(`Spot oracle for ${baseId}/${ilkId} set to ${oracleAddress} with ratio ${ratio}`)
  }

  return proposal
}
