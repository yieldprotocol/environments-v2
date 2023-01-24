/**
 * @dev This script replaces one or more data sources in a NotionalMultiOracle.
 */

import { ethers } from 'hardhat'
import { NotionalMultiOracle } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const updateNotionalSources = async (
  oracle: NotionalMultiOracle,
  sources: [string, string, string, string][], // fcash, notionalId, underlyingId, underlying
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `UPDATE_NOTIONAL_SOURCES`))
  const proposal: Array<{ target: string; data: string }> = []
  for (let [fcashAddress, notionalId, underlyingId, underlyingAddress] of sources) {
    if ((await ethers.provider.getCode(fcashAddress)) === '0x') throw `Address ${fcashAddress} contains no code`
    if ((await ethers.provider.getCode(underlyingAddress)) === '0x')
      throw `Address ${underlyingAddress} contains no code`
    console.log(
      indent(nesting, `Setting up ${fcashAddress} as the source for ${notionalId}/${underlyingId} at ${oracle.address}`)
    )

    proposal.push({
      target: oracle.address,
      data: oracle.interface.encodeFunctionData('setSource', [notionalId, underlyingId, underlyingAddress]),
    })
  }

  return proposal
}
