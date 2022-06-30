// TODO: REFACTOR FOR FYTOKEN

import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../../shared/helpers'

import { YIELDSPACE } from '../../../../../../shared/constants'

import { orchestrateJoinProposal } from '../../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { updateYieldSpaceMultiOracleSourcesProposal } from '../../../../../fragments/oracles/updateYieldSpaceMultiOracleSourcesProposal'
import { addAssetProposal } from '../../../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'

import {
  IOracle,
  NotionalMultiOracle,
  Cauldron,
  Ladle,
  Witch,
  Timelock,
  EmergencyBrake,
} from '../../../../../../typechain'

const {
  developer,
  deployer,
  notionalSources,
  fCashAddress,
  notionalDebtLimits,
  auctionLimits,
  seriesIlks,
} = require(process.env.CONF as string)

/**
 * @dev This script configures the Yield Protocol to use fyTokens as collateral.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const joins = readAddressMappingIfExists('newJoins.json')
  const governance = readAddressMappingIfExists('governance.json')

  const yieldSpaceMultiOracle = await ethers.getContractAt(
    'YieldSpaceMultiOracle',
    protocol.get(YIELDSPACE) as string
  )

  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  let assetsAndJoins: Array<[string, string, string]> = []
  for (let [assetId, joinAddress] of joins) {
    assetsAndJoins.push([assetId, fCashAddress, joinAddress])
    console.log(`Using ${fCashAddress} as Join for ${joinAddress}`)
  }

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await updateNotionalSourcesProposal(notionalOracle, notionalSources))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      notionalOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      joins,
      notionalDebtLimits,
      auctionLimits
    )
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
