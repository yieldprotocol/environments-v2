// Add a series to the protocol:
//  - The series will be added to the Cauldron
//  - The ilks will be enabled for the series
//  - The fyToken and pool will be added to the Ladle
//  - The fyToken will be added to the Witch

import { Cauldron, FYToken__factory, Ladle, EmergencyBrake, Witch } from '../../../typechain'
import { Series } from '../../governance/confTypes'
import { addFYToken } from '../ladle/addFYToken'
import { addPool } from '../ladle/addPool'
import { addFYTokenToWitch } from '../witch/addFYTokenToWitch'
import { addIlkToSeries } from './addIlkToSeries'

export const addSeries = async (
  ownerAcc: any,
  cauldron: Cauldron,
  ladle: Ladle,
  witch: Witch,
  cloak: EmergencyBrake,
  series: Series,
  pools: Map<string, string> // seriesId, poolAddress
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  console.log(`Using fyToken at ${series.fyToken} for ${series.seriesId}`)
  const fyToken = FYToken__factory.connect(series.fyToken.address, ownerAcc)
  const baseId = await fyToken.underlyingId()

  const poolAddress = pools.getOrThrow(series.seriesId)

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addSeries', [series.seriesId, baseId, fyToken.address]),
  })
  console.log(`Adding ${series.seriesId} using ${fyToken.address}`)

  for (let ilk of series.ilks) {
    proposal = proposal.concat(await addIlkToSeries(cauldron, series, ilk))
  }
  proposal = proposal.concat(await addPool(ladle, series.seriesId, poolAddress))
  proposal = proposal.concat(await addFYToken(cloak, ladle, series.seriesId, fyToken))
  proposal = proposal.concat(await addFYTokenToWitch(cloak, witch, series.seriesId, fyToken))

  return proposal
}
