import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../shared/helpers'

import { orchestrateStrategiesProposal } from '../../fragments/core/strategies/orchestrateStrategiesProposal'
import { initStrategiesProposal } from '../../fragments/core/strategies/initStrategiesProposal'
import { Cauldron, Ladle, OnChainTest, Timelock } from '../../../typechain'
import { onChainTestProposal } from '../../fragments/utils/onChainTestProposal'
const { protocol, governance, newJoins, assets } = require(process.env.CONF as string)
const { developer, strategiesData, strategiesInit, newStrategies } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates and initializes strategies
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const onChainTest = (await ethers.getContractAt(
    'OnChainTest',
    protocol.get('onChainTest') as string,
    ownerAcc
  )) as unknown as OnChainTest
  let assetsAndJoins: [string, string, string][] = []
  // console.log(` AssetId      | Asset Address                            | Join Address`)

  for (let [assetId, joinAddress] of newJoins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
  }
  // Remember to put enough DAI and USDC in the Timelock to initialize strategies

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit))
  proposal = proposal.concat(await onChainTestProposal(cauldron, onChainTest, assetsAndJoins))
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
