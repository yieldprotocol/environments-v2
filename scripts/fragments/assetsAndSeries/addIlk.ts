// Add an asset to the protocol
// - The asset will be made into an ilk
// - The ilk will be enabled for a number of series

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Cauldron, EmergencyBrake, Witch } from '../../../typechain'
import { makeIlk } from './makeIlk'
import { addIlkToSeries } from './addIlkToSeries'
import { Series, Ilk } from '../../governance/confTypes'
import { makeAsset } from './makeAsset'

export const addIlk = async (
  ownerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  witch: Witch,
  series: Series[],
  ilk: Ilk,
  joins: Map<string, string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  let proposal = await makeAsset(cauldron, ilk.asset)
  proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joins, nesting + 1))
  for (let series_ of series) {
    proposal = proposal.concat(await addIlkToSeries(cauldron, series_, ilk, nesting + 1))
  }

  return proposal
}
