import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import {
  IOracle,
  CompositeMultiOracle__factory,
  UniswapV3Oracle__factory,
  Cauldron__factory,
  Ladle__factory,
  EmergencyBrake__factory,
  Timelock__factory,
  OldWitch__factory,
  OldEmergencyBrake__factory,
} from '../../../../../typechain'

import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlkProposal'
import { updateCompositeSourcesProposal } from '../../../../fragments/oracles/updateCompositeSourcesProposal'
import { updateUniswapSourcesProposal } from '../../../../fragments/oracles/updateUniswapSourcesProposal'
import { CAULDRON, CLOAK, COMPOSITE, LADLE, TIMELOCK, UNISWAP, WITCH_V1 } from '../../../../../shared/constants'
import { updateCompositePathsProposal } from '../../../../fragments/oracles/updateCompositePathsProposal'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const { seriesIlks, compositeSources, uniswapOracleSources, newCompositePaths } = require(process.env.CONF as string)
const { newCrabLimits, strategyAuctionLimits, assets, newJoins } = require(process.env.CONF as string)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const compositeOracle = CompositeMultiOracle__factory.connect(protocol().getOrThrow(COMPOSITE)!, ownerAcc)
  const uniswapOracle = UniswapV3Oracle__factory.connect(protocol().getOrThrow(UNISWAP)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE)!, ownerAcc)
  const witch = OldWitch__factory.connect(protocol().getOrThrow(WITCH_V1)!, ownerAcc)
  const cloak = OldEmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  let assetsAndJoins: [string, string, string][] = []

  for (let [assetId, joinAddress] of newJoins) {
    assetsAndJoins.push([assetId, assets.getOrThrow(assetId) as string, joinAddress])
  }
  console.table(assetsAndJoins)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  // Oracles
  proposal = proposal.concat(await updateUniswapSourcesProposal(uniswapOracle, uniswapOracleSources))
  proposal = proposal.concat(await updateCompositeSourcesProposal(ownerAcc, compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, newCompositePaths))
  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, cloak, assetsAndJoins))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cloak, cauldron, ladle, assetsAndJoins))
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
