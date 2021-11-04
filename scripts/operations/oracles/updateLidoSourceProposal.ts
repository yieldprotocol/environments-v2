/**
 * @dev This script replaces the data source in the LidoOracle.
 *
 * It takes as inputs the governance and protocol json address files.
 */

import { ethers } from 'hardhat'
import { bytesToString } from '../../../shared/helpers'
import { WAD, WSTETH, STETH } from '../../../shared/constants'

import { LidoOracle, IWstETH } from '../../../typechain'

export const updateLidoSourceProposal = async (
  ownerAcc: any,
  lidoOracle: LidoOracle,
  source: string
): Promise<Array<{ target: string; data: string }>>  => {
  const proposal: Array<{ target: string; data: string }> = []
  if ((await ethers.provider.getCode(source)) === '0x') throw `Address ${source} contains no code`

  const lidoSource = (await ethers.getContractAt(
    'IWstETH',
    source,
    ownerAcc
  )) as unknown as IWstETH
  
  console.log(
    `Current rate for ${bytesToString(STETH)}/${bytesToString(WSTETH)}: ${await lidoSource.callStatic.getWstETHByStETH(WAD)}`
  )
  console.log(
    `Current rate for ${bytesToString(WSTETH)}/${bytesToString(STETH)}: ${await lidoSource.callStatic.getStETHByWstETH(WAD)}`
  )

  proposal.push({
    target: lidoOracle.address,
    data: lidoOracle.interface.encodeFunctionData('setSource', source),
  })
  console.log(`source: ${bytesToString(STETH)}/${bytesToString(WSTETH)} -> ${source}`)
  return proposal
}