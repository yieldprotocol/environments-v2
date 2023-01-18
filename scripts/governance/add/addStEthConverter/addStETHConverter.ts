import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'

import { addTokenProposal } from '../../../fragments/ladle/addToken'
import { addIntegrationProposal } from '../../../fragments/ladle/addIntegration'
import { Cauldron, Ladle, Timelock } from '../../../../typechain'
import { STETH, WSTETH } from '../../../../shared/constants'

const { developer, governance, protocol } = require(process.env.CONF as string)

/**
 * @dev This script:
 *   1. Adds wstETH and stETH as tokens to Ladle, to allow `transfer` and `permit`
 *   2. Adds stEthConverter as an integration to Ladle, to allow `route`
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  // const wstEthAddress = await cauldron.assets(WSTETH)
  const stEthAddress = await cauldron.assets(STETH)
  // console.log(`Using wstETH at ${wstEthAddress}`)
  console.log(`Using stETH at ${stEthAddress}`)

  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal: Array<{ target: string; data: string }> = []
  // proposal = proposal.concat(await addTokenProposal(ladle, wstEthAddress))
  proposal = proposal.concat(await addTokenProposal(ladle, stEthAddress))
  proposal = proposal.concat(await addIntegrationProposal(ladle, protocol.get('stEthConverter') as string))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
