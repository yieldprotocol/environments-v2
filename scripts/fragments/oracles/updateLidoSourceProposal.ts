/**
 * @dev This script replaces the data source in the LidoOracle.
 */

import { ethers } from 'hardhat'
import { bytesToString } from '../../../shared/helpers'
import { WAD, WSTETH, STETH } from '../../../shared/constants'

import { LidoOracle } from '../../../typechain'

export const updateLidoSourceProposal = async (
  lidoOracle: LidoOracle,
  source: string
): Promise<Array<{ target: string; data: string }>> => {
  const [ownerAcc] = await ethers.getSigners()

  const proposal: Array<{ target: string; data: string }> = []
  if ((await ethers.provider.getCode(source)) === '0x') throw `Address ${source} contains no code`

  const wstEth = await ethers.getContractAt('IWstETH', source, ownerAcc)

  console.log(
    `Current rate for ${bytesToString(STETH)}/${bytesToString(WSTETH)}: ${await wstEth.callStatic.getWstETHByStETH(
      WAD
    )}`
  )
  console.log(
    `Current rate for ${bytesToString(WSTETH)}/${bytesToString(STETH)}: ${await wstEth.callStatic.getStETHByWstETH(
      WAD
    )}`
  )

  proposal.push({
    target: lidoOracle.address,
    data: lidoOracle.interface.encodeFunctionData('setSource', [source]),
  })

  console.log(`source: ${bytesToString(STETH)}/${bytesToString(WSTETH)} -> ${source}`)
  return proposal
}
