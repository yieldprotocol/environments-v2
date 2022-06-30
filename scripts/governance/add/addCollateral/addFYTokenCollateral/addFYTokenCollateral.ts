import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../shared/helpers'

import { YIELDSPACE } from '../../../../../shared/constants'

import { orchestrateYieldSpaceOracleProposal } from '../../../../fragments/oracles/orchestrateYieldSpaceMultiOracleProposal'
import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { updateYieldSpaceMultiOracleSourcesProposal } from '../../../../fragments/oracles/updateYieldSpaceMultiOracleSourcesProposal'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { deployTVPoolOracle } from '../../../../fragments/oracles/deployTVPoolOracle'
import { deployYieldSpaceMultiOracle } from '../../../../fragments/oracles/deployYieldSpaceMultiOracle'

const {
  developer,
  deployer,
  protocol,
  governance,
  assetsToAdd,
  fyTokenDebtLimits,
  auctionLimits,
  seriesIlks,
} = require(process.env.CONF as string)

import { fyTokenSources } from './addFYTokenCollateral.arb_mainnet.config'

/**
 * @dev This script configures the Yield Protocol to use fyTokens as collateral.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  // Deploy TWAR oracle for new pools (TV pools) --- script is idempodent
  const poolOracle = await deployTVPoolOracle(ownerAcc, protocol)
  
  // Deploy YieldSpaceMultiOracle --- script is idempodent
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  await deployYieldSpaceMultiOracle(ownerAcc, poolOracle.address, timelock, protocol)

  // joins were deployed in previous script
  const joins = readAddressMappingIfExists('newJoins.json')

  const yieldSpaceMultiOracle = await ethers.getContractAt('YieldSpaceMultiOracle', protocol.get(YIELDSPACE) as string)
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)

  const proposal = [
    await orchestrateYieldSpaceOracleProposal(deployer, yieldSpaceMultiOracle, timelock, cloak),
    await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsToAdd),
    await updateYieldSpaceMultiOracleSourcesProposal(yieldSpaceMultiOracle, fyTokenSources),
    await addAssetProposal(ownerAcc, cauldron, ladle, assetsToAdd),
    await makeIlkProposal(
      ownerAcc,
      yieldSpaceMultiOracle,
      cauldron,
      witch,
      cloak,
      joins,
      fyTokenDebtLimits,
      auctionLimits
    ),
    // await addIlksToSeriesProposal(cauldron, seriesIlks)
  ].flat(1)


  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
