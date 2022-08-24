import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { orchestrateJoinProposal } from '../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { updateCompositeSourcesProposal } from '../../../fragments/oracles/updateCompositeSourcesProposal'

const {
  developer,
  deployer,
  protocol,
  governance,
  assetsToAdd,
  fyTokenDebtLimits,
  auctionLimits,
  seriesIlks,
  compositeSources,
  compositePaths,
  fyTokens,
  pools,
  bases,
} = require(process.env.CONF as string)

import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePathsProposal'
import { IOracle } from '../../../../typechain'
import { contangoCauldron_key, contangoLadle_key } from '../../../../shared/constants'
import { addSeriesProposal } from '../shared/addSeriesProposal'
import { makeBaseProposal } from '../shared/makeBaseProposal'

/**
 * @dev This script configures the Yield Protocol to use fyTokens as collateral.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  // joins were deployed in previous script
  const newJoins = readAddressMappingIfExists('newJoins.json')

  const cauldron = await ethers.getContractAt('Cauldron', protocol.get(contangoCauldron_key) as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get(contangoLadle_key) as string, ownerAcc)
  const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const compositeMultiOracle = await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )
  const accumulatorOracle = await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol.get('accumulatorOracle') as string,
    ownerAcc
  )

  const proposal = [
    await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsToAdd),
    await updateCompositeSourcesProposal(ownerAcc, protocol, compositeMultiOracle, compositeSources),
    await updateCompositePathsProposal(compositeMultiOracle, compositePaths),
    await addAssetProposal(ownerAcc, cauldron, ladle, assetsToAdd),
    await makeBaseProposal(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, bases),
    await addSeriesProposal(ownerAcc, cauldron, ladle, cloak, fyTokens, pools),
    await makeIlkProposal(
      ownerAcc,
      compositeMultiOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      newJoins,
      fyTokenDebtLimits,
      auctionLimits
    ),
    await addIlksToSeriesProposal(cauldron, seriesIlks),
  ].flat(1)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
