/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { ethers } from 'hardhat'
import { getName } from '../../../shared/helpers'
import { Cauldron, IOracle, Join__factory, EmergencyBrake, Witch } from '../../../typechain'
import { AuctionLineAndLimit } from '../../governance/confTypes'
import { addIlkToWitch } from '../witch/addIlkToWitch'
import { setLineAndLimit } from '../witch/setLineAndLimit'

export const makeIlk = async (
  ownerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  spotOracle: IOracle,
  cauldron: Cauldron,
  witch: Witch,
  debtLimits: Array<[string, string, number, number, number, number]>,
  auctionLineAndLimits: AuctionLineAndLimit[],
  joins: Map<string, string> // assetId, joinAddress
): Promise<Array<{ target: string; data: string }>> => {
  let proposal = setLineAndLimit(witch, auctionLineAndLimits)

  const ilkIds = new Set(auctionLineAndLimits.map(({ ilkId }) => ilkId))
  for (const ilkId of ilkIds) {
    const join = Join__factory.connect(joins.get(ilkId)!, ownerAcc)

    proposal = proposal.concat(await addIlkToWitch(cloak, witch, ilkId, join))
  }

  for (let [baseId, ilkId, ratio, line, dust, dec] of debtLimits) {
    console.log(
      `Setting spot oracle for ${getName(baseId)}/${getName(ilkId)} to address: ${
        spotOracle.address
      }, ratio: ${ethers.utils.formatUnits(ratio, 6)}`
    )
    // Set the spot oracle in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setSpotOracle', [baseId, ilkId, spotOracle.address, ratio]),
    })

    console.log(
      `Setting debt limits for ${getName(baseId)}/${getName(
        ilkId
      )} maxDebt: ${line}, minDebt: ${dust}, decimals: ${dec}`
    )
    // Set the base/ilk limits in the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('setDebtLimits', [baseId, ilkId, line, dust, dec]),
    })
  }

  return proposal
}
