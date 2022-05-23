import { ethers } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../shared/helpers'

import { NOTIONAL } from '../../../../../shared/constants'

import { orchestrateTWAROracleProposal } from '../../../../fragments/oracles/orchestrateTWAROracleProposal'
import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { updateTWARSourcesProposal } from '../../../../fragments/oracles/updateTWARSourcesProposal'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'

import {
  IOracle,
  TWARMultiOracle,
  Cauldron,
  Ladle,
  Witch,
  Timelock,
  EmergencyBrake,
} from '../../../../../typechain'

const {
  developer,
  deployer,
  protocol,
  governance,
  assetsToAdd,
  notionalSources,
  notionalDebtLimits,
  auctionLimits,
  seriesIlks,
} = require(process.env.CONF as string)

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const twarOracle = (await ethers.getContractAt(
    'TWARMultiOracle',
    protocol.get(TWAR) as string
  )) as unknown as TWARMultiOracle
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

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateTWAROracleProposal(deployer, twarOracle, timelock, cloak))
  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsToAdd))
  proposal = proposal.concat(await updateTWARSourcesProposal(twarOracle, notionalSources))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsToAdd))
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      twarOracle as unknown as IOracle,
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
