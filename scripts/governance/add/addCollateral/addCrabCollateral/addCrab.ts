import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import { IOracle, CrabOracle, CompositeMultiOracle, UniswapV3Oracle } from '../../../../../typechain'
import { Ladle } from '../../../../../typechain'
import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlkProposal'
import { orchestrateCrabOracleProposal } from '../../../../fragments/oracles/orchestrateCrabOracleProposal'
import { updateCrabOracleSourcesProposal } from '../../../../fragments/oracles/updateCrabOracleSourcesProposal'
import { updateCompositeSourcesProposal } from '../../../../fragments/oracles/updateCompositeSourcesProposal'
import { updateUniswapSourcesProposal } from '../../../../fragments/oracles/updateUniswapSourcesProposal'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const { seriesIlks, crabOracleSource, compositeSources, uniswapOracleSources } = require(process.env.CONF as string)
const { newCrabLimits, strategyAuctionLimits, assets, newJoins } = require(process.env.CONF as string)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const crabOracle = await ethers.getContractAt('CrabOracle', protocol.get('crabOracle') as string, ownerAcc)
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const uniswapOracle = (await ethers.getContractAt(
    'UniswapV3Oracle',
    protocol.get('uniswapOracle') as string,
    ownerAcc
  )) as unknown as UniswapV3Oracle
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const witch = await ethers.getContractAt('OldWitch', protocol.get('witch') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  let assetsAndJoins: [string, string, string][] = []

  for (let [assetId, joinAddress] of newJoins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
  }
  console.table(assetsAndJoins)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  // Oracles
  proposal = proposal.concat(await updateUniswapSourcesProposal(uniswapOracle, uniswapOracleSources))
  // Orchestrate Crab Oracle
  proposal = proposal.concat(await orchestrateCrabOracleProposal(ownerAcc.address, crabOracle, timelock, cloak))
  proposal = proposal.concat(await updateCompositeSourcesProposal(ownerAcc, compositeOracle, compositeSources))
  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  // Ilks
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      compositeOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      newJoins,
      newCrabLimits,
      strategyAuctionLimits
    )
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await propose(timelock, proposal, developer)
  }
})()
