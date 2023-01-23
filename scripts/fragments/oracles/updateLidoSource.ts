/**
 * @dev This script replaces the data source in the LidoOracle.
 */

import { ethers } from 'hardhat'
import { getName } from '../../../shared/helpers'
import { WAD, WSTETH, STETH } from '../../../shared/constants'

import { LidoOracle, IWstETH } from '../../../typechain'

export const updateLidoSource = async (
  lidoOracle: LidoOracle,
  source: string
): Promise<Array<{ target: string; data: string }>> => {
  const [ownerAcc] = await ethers.getSigners()

  const proposal: Array<{ target: string; data: string }> = []
  if ((await ethers.provider.getCode(source)) === '0x') throw `Address ${source} contains no code`

  const wstEth = (await ethers.getContractAt('IWstETH', source, ownerAcc)) as unknown as IWstETH

  console.log(`Current rate for ${getName(STETH)}/${getName(WSTETH)}: ${await wstEth.callStatic.getWstETHByStETH(WAD)}`)
  console.log(`Current rate for ${getName(WSTETH)}/${getName(STETH)}: ${await wstEth.callStatic.getStETHByWstETH(WAD)}`)

  proposal.push({
    target: lidoOracle.address,
    data: lidoOracle.interface.encodeFunctionData('setSource', [source]),
  })

  console.log(`source: ${getName(STETH)}/${getName(WSTETH)} -> ${source}`)
  return proposal
}
