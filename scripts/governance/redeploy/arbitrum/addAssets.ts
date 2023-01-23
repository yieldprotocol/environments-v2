import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute, readAddressMappingIfExists } from '../../../../shared/helpers'

import { orchestrateJoinProposal } from '../../../fragments/core/removeDeployerRootToCloak'
// import { updateChainlinkSourcesProposal } from '../../../fragments/oracles/updateChainlinkSourcesProposal'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAsset'
import { makeIlkProposal } from '../../../fragments/assetsAndSeries/makeIlk'
import { makeBaseProposal } from '../../../fragments/assetsAndSeries/makeBase'

import {
  AccumulatorMultiOracle,
  Cauldron,
  ChainlinkUSDMultiOracle,
  EmergencyBrake,
  IOracle,
  Ladle,
  Timelock,
  Witch,
} from '../../../../typechain'
import { ACCUMULATOR, CHAINLINKUSD } from '../../../../shared/constants'

const {
  developer,
  deployer,
  assets,
  bases,
  chainlinkDebtLimits,
  chainlinkAuctionLimits,
  newJoins,
  protocol,
  governance,
} = require(process.env.CONF as string)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const chainlinkUSDOracle = (await ethers.getContractAt(
    'ChainlinkUSDMultiOracle',
    protocol.get(CHAINLINKUSD) as string,
    ownerAcc
  )) as unknown as ChainlinkUSDMultiOracle
  const accumulatorOracle = (await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol.get(ACCUMULATOR) as string,
    ownerAcc
  )) as unknown as AccumulatorMultiOracle
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

  let assetsAndJoins: [string, string, string][] = []
  console.log(` AssetId      | Asset Address                            | Join Address`)

  for (let [assetId, joinAddress] of newJoins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
    console.log(`${[assetId, assets.get(assetId) as string, joinAddress]}`)
  }

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      chainlinkUSDOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      newJoins,
      chainlinkDebtLimits,
      chainlinkAuctionLimits
    )
  )
  proposal = proposal.concat(
    await makeBaseProposal(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, ladle, witch, cloak, bases)
  )

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
