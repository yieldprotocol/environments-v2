// Add an asset to the protocol
// - The asset will be made into an ilk
// - The ilk will be enabled for a number of series

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Cauldron, EmergencyBrake, Witch } from '../../../typechain'
import { makeIlk } from './makeIlk'
import { addIlkToSeries } from './addIlkToSeries'
import { Series, Ilk } from '../../governance/confTypes'

export const addIlk = async (
  ownerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  witch: Witch,
  series: Series[],
  ilk: Ilk,
  joins: Map<string, string>, // assetId, joinAddress
  addToWitch: boolean = true
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joins, addToWitch))
  for (let series_ of series) {
    proposal = proposal.concat(await addIlkToSeries(cauldron, series_, ilk))
  }

  return proposal
}
