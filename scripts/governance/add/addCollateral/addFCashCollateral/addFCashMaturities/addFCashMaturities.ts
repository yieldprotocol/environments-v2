import { ethers } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../../shared/helpers'

import { NOTIONAL } from '../../../../../../shared/constants'

import { orchestrateJoinProposal } from '../../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { updateNotionalSourcesProposal } from '../../../../../fragments/oracles/updateNotionalSourcesProposal'
import { addAssetProposal } from '../../../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'

import { IOracle } from '../../../../../../typechain'

const {
  developer,
  deployer,
  notionalSources,
  fCashAddress,
  notionalDebtLimits,
  auctionLimits,
  seriesIlks,
  protocol,
  governance,
  newJoins,
} = require(process.env.CONF as string)

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const notionalOracle = await ethers.getContractAt('NotionalMultiOracle', protocol.get(NOTIONAL) as string)
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string)
  const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string)

  let assetsAndJoins: Array<[string, string, string]> = []
  for (let [assetId, joinAddress] of newJoins) {
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
      newJoins,
      notionalDebtLimits,
      auctionLimits
    )
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
