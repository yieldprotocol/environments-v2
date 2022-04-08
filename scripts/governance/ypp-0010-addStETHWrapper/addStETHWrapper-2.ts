import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../shared/helpers'
import { addTokenProposal } from '../../fragments/ladle/addTokenProposal'
import { addIntegrationProposal } from '../../fragments/ladle/addIntegrationProposal'
import { STETH, WSTETH } from '../../../shared/constants'
import { developer } from './addStETHWrapper.config'

/**
 * @dev This script:
 *   1. Adds wstETH and stETH as tokens to Ladle, to allow `transfer` and `permit`
 *   2. Adds lidoWrapHandler as an integration to Ladle, to allow `route`
 *   3. Adds a STETH/ETH/DAI and STETH/ETH/USDC paths to the CompositeOracle, to be used by the frontend
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')

  const lidoWrapHandlerAddress: string = protocol.get('lidoWrapHandler') as string
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const wstEthAddress = await cauldron.assets(WSTETH)
  const stEthAddress = await cauldron.assets(STETH)
  console.log(`Using wstETH at ${wstEthAddress}`)
  console.log(`Using stETH at ${stEthAddress}`)

  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await addTokenProposal(ladle, wstEthAddress))
  proposal = proposal.concat(await addTokenProposal(ladle, stEthAddress))
  proposal = proposal.concat(await addIntegrationProposal(ladle, lidoWrapHandlerAddress))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
