import { bytesToString } from '../../../shared/helpers'
import { Cauldron } from '../../../typechain/Cauldron'

export const addIlksToSeriesProposal = async (
  cauldron: Cauldron,
  seriesIlks: Array<[string, string[]]>,
): Promise<Array<{ target: string; data: string }>>  => {
const proposal: Array<{ target: string; data: string }> = []

for (let [seriesId, ilkIds] of seriesIlks) {
  const symbol = bytesToString(seriesId)

  // const series = await cauldron.series(seriesId)
  // console.log(`Updating ${seriesId} (${series})`)
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addIlks', [seriesId, ilkIds]),
  })
  console.log(`addIlks ${symbol}: ${ilkIds}`)
}

return proposal
}