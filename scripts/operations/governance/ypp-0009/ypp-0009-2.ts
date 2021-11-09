import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { addTokenProposal } from '../../ladle/addTokenProposal'
import { addIntegrationProposal } from '../../ladle/addIntegrationProposal'
import { Ladle, Timelock } from '../../../../typechain'
import { WSTETH, STETH } from '../../../../shared/constants'

/**
 * @dev This script:
 *   1. Adds wstETH and stETH as tokens to Ladle, to allow `transfer` and `permit`
 *   2. Adds lidoWrapHandler as an integration to Ladle, to allow `route`
 */

;(async () => {
  const developerIfImpersonating = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)

  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  const wstEthAddress: string = assets.get(WSTETH) as string
  const stEthAddress: string = assets.get(STETH) as string
  const lidoWrapHandler: string = protocol.get('lidoWrapHandler') as string

  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal = await addTokenProposal(ladle, wstEthAddress)
  proposal = proposal.concat(await addTokenProposal(ladle, stEthAddress))
  proposal = proposal.concat(await addIntegrationProposal(ladle, lidoWrapHandler))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
