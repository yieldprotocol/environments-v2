// Make an asset into an ilk.
// - Collateralization config is set for the base/ilk pair.
// - Debt limits are set for the base/ilk pair.
// - If liquidations are enabled, the asset is added to the Witch.

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Cauldron, Join__factory, EmergencyBrake, Witch } from '../../../typechain'
import { Ilk } from '../../governance/confTypes'
import { addIlkToWitch } from '../witch/addIlkToWitch'
import { updateDebtLimits } from '../limits/updateDebtLimits'
import { updateCollateralization } from '../oracles/updateCollateralization'
import { indent } from '../../../shared/helpers'

export const makeIlk = async (
  ownerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  witch: Witch,
  ilk: Ilk,
  joins: Map<string, string>, // assetId, joinAddress,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MAKE_ILK`))
  let proposal: Array<{ target: string; data: string }> = []
  const join = Join__factory.connect(joins.get(ilk.ilkId)!, ownerAcc)

  proposal = proposal.concat(await updateCollateralization(cauldron, ilk.collateralization, nesting + 1))
  proposal = proposal.concat(await updateDebtLimits(cauldron, ilk, nesting + 1))

  // Some ilks are not liquidable
  if (ilk.auctionLineAndLimit !== undefined) {
    proposal = proposal.concat(await addIlkToWitch(cloak, witch, ilk, join, nesting + 1))
  }

  return proposal
}
