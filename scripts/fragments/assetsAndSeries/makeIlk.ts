/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { getName } from '../../../shared/helpers'
import { Cauldron, IOracle, Join__factory, EmergencyBrake, Witch } from '../../../typechain'
import { Ilk } from '../../governance/confTypes'
import { addIlkToWitch } from '../witch/addIlkToWitch'
import { setLineAndLimit } from '../witch/setLineAndLimit'

export const makeIlk = async (
  ownerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  spotOracle: IOracle,
  cauldron: Cauldron,
  witch: Witch,
  ilk: Ilk,
  joins: Map<string, string> // assetId, joinAddress
): Promise<Array<{ target: string; data: string }>> => {
  let proposal = setLineAndLimit(witch, ilk.auctionLineAndLimit)

  const join = Join__factory.connect(joins.get(ilk.ilkId)!, ownerAcc)

  proposal = proposal.concat(await addIlkToWitch(cloak, witch, ilk.ilkId, join))

  console.log(
    `Setting spot oracle for ${getName(ilk.baseId)}/${getName(ilk.ilkId)} to address: ${
      spotOracle.address
    }, ratio: ${ethers.utils.formatUnits(ilk.debtLimits.ratio, 6)}`
  )
  // Set the spot oracle in the Cauldron
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('setSpotOracle', [
      ilk.baseId,
      ilk.ilkId,
      spotOracle.address,
      ilk.debtLimits.ratio,
    ]),
  })

  console.log(
    `Setting debt limits for ${getName(ilk.baseId)}/${getName(ilk.ilkId)} maxDebt: ${ilk.debtLimits.line}, minDebt: ${
      ilk.debtLimits.dust
    }, decimals: ${ilk.debtLimits.dec}`
  )
  // Set the base/ilk limits in the Cauldron
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('setDebtLimits', [
      ilk.baseId,
      ilk.ilkId,
      ilk.debtLimits.line,
      ilk.debtLimits.dust,
      ilk.debtLimits.dec,
    ]),
  })

  return proposal
}
