import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Cauldron, IOracle, EmergencyBrake, Witch } from '../../../typechain'
import { makeIlk } from './makeIlk'
import { addIlkToSeries } from './addIlkToSeries'
import { Series, Ilk } from '../../governance/confTypes'

export const addIlk = async (
  ownerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  spotOracle: IOracle,
  cauldron: Cauldron,
  witch: Witch,
  series: Series[],
  ilk: Ilk,
  joins: Map<string, string> // assetId, joinAddress
): Promise<Array<{ target: string; data: string }>> => {
  let proposal = await makeIlk(ownerAcc, cloak, spotOracle, cauldron, witch, ilk, joins)
  for (let series_ of series) {
    proposal = proposal.concat(await addIlkToSeries(cauldron, series_, ilk))
  }

  return proposal
}
