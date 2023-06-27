// Update the collateralization configuration for an ilk

import { ethers } from 'hardhat'
import { getName, indent } from '../../../shared/helpers'
import { Cauldron } from '../../../typechain'
import { Collateralization } from '../../governance/confTypes'

export const updateCollateralization = async (
  cauldron: Cauldron,
  { baseId, ilkId, oracle, ratio }: Collateralization,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_COLLATERALIZATION`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('setSpotOracle', [baseId, ilkId, oracle, ratio]),
  })
  console.log(
    indent(
      nesting,
      `Spot oracle for ${getName(baseId)}/${getName(ilkId)} set to ${oracle} with ratio ${ethers.utils.formatUnits(
        ratio,
        6
      )}%`
    )
  )

  return proposal
}
