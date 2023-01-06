/**
 * @dev This script makes one or more assets into bases.
 *
 * It takes as inputs the governance and protocol address files.
 * Sets the lending oracle and allows the Witch to liquidate debt.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { getName } from '../../../shared/helpers'
import { Cauldron, IOracle, Join__factory, EmergencyBrake, Witch } from '../../../typechain'
import { addBaseToWitch } from '../witch/addBaseToWitch'

export const makeBase = async (
  ownerAcc: any,
  lendingOracle: IOracle,
  cauldron: Cauldron,
  witch: Witch,
  cloak: EmergencyBrake,
  bases: Array<[string, string]>
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  for (let [assetId, joinAddress] of bases) {
    const join = Join__factory.connect(joinAddress, ownerAcc)

    proposal = proposal.concat(await addBaseToWitch(cloak, witch, assetId, join))

    // Add the asset as a base
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setLendingOracle', [assetId, lendingOracle.address]),
    })
    console.log(`Asset ${getName(assetId)} made into base using ${lendingOracle.address}`)
  }

  return proposal
}
