/**
 * @dev This script adds one or more series to the protocol.
 */

import { Cauldron, FYToken__factory, Ladle, EmergencyBrake, Witch } from '../../../typechain'
import { SeriesToAdd } from '../../governance/confTypes'
import { addFYToken } from '../ladle/addFYToken'
import { addPool } from '../ladle/addPool'
import { addFYTokenToWitch } from '../witch/addFYTokenToWitch'

export const addSeries = async (
  ownerAcc: any,
  cauldron: Cauldron,
  ladle: Ladle,
  witch: Witch,
  cloak: EmergencyBrake,
  seriesToAdd: SeriesToAdd[],
  pools: Map<string, string> // seriesId, poolAddress
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let { seriesId, fyToken: fyTokenAddress } of seriesToAdd) {
    console.log(`Using fyToken at ${fyTokenAddress} for ${seriesId}`)
    const fyToken = FYToken__factory.connect(fyTokenAddress, ownerAcc)

    const poolAddress = pools.getOrThrow(seriesId)

    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('addSeries', [seriesId, baseId, fyToken.address]),
    })
    console.log(`Adding ${seriesId} using ${fyToken.address}`)

    proposal = proposal.concat(await addPool(ladle, seriesId, poolAddress))
    proposal = proposal.concat(await addFYToken(cloak, ladle, seriesId, fyToken))
    proposal = proposal.concat(await addFYTokenToWitch(cloak, witch, seriesId, fyToken))
  }

  return proposal
}
