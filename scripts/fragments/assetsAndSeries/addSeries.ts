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
import { getName, indent } from '../../../shared/helpers'

export const addSeries = async (
  ownerAcc: any,
  cauldron: Cauldron,
  ladle: Ladle,
  witch: Witch,
  cloak: EmergencyBrake,
  series: Series,
  pools: Map<string, string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_SERIES`))
  let proposal: Array<{ target: string; data: string }> = []

  console.log(indent(nesting, `Using fyToken at ${series.fyToken.address} as ${series.fyToken.assetId}`))
  const fyToken = FYToken__factory.connect(series.fyToken.address, ownerAcc)
  const baseId = await fyToken.underlyingId()
  console.log(indent(nesting, `Using pool at ${series.pool.address} as ${series.pool.assetId}`))
  const poolAddress = pools.getOrThrow(series.pool.assetId)!

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('addSeries', [series.seriesId, baseId, fyToken.address]),
  })
  console.log(indent(nesting, `Adding ${getName(series.seriesId)} using ${fyToken.address}`))

  for (let ilk of series.ilks) {
    proposal = proposal.concat(await addIlkToSeries(cauldron, series, ilk, nesting + 1))
  }
  proposal = proposal.concat(await addPool(ladle, series.seriesId, poolAddress, nesting + 1))
  proposal = proposal.concat(await addFYToken(cloak, ladle, series.seriesId, fyToken, nesting + 1))
  proposal = proposal.concat(await addFYTokenToWitch(cloak, witch, series.seriesId, fyToken, nesting + 1))

  return proposal
}
