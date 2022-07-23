import { ethers } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../shared/helpers'

import { NOTIONAL } from '../../../../../shared/constants'

import { orchestrateNotionalOracleProposal } from '../../../../fragments/oracles/orchestrateNotionalOracleProposal'
import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { orchestrateModuleProposal } from '../../../../fragments/modules/orchestrateModuleProposal'
import { updateNotionalSourcesProposal } from '../../../../fragments/oracles/updateNotionalSourcesProposal'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'

import {
  Transfer1155Module,
  IOracle,
  NotionalMultiOracle,
  Cauldron,
  Ladle,
  Witch,
  Timelock,
  EmergencyBrake,
} from '../../../../../typechain'

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
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const joins = readAddressMappingIfExists('newJoins.json')
  const governance = readAddressMappingIfExists('governance.json')

  const notionalOracle = (await ethers.getContractAt(
    'NotionalMultiOracle',
    protocol.get(NOTIONAL) as string
  )) as unknown as NotionalMultiOracle
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let assetsAndJoins: Array<[string, string, string]> = []
  for (let [assetId, joinAddress] of joins) {
    assetsAndJoins.push([assetId, fCashAddress, joinAddress])
    console.log(`Using ${fCashAddress} as Join for ${joinAddress}`)
  }

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateNotionalOracleProposal(deployer, notionalOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateModuleProposal(ladle, protocol.get('transfer1155Module') as string))
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
