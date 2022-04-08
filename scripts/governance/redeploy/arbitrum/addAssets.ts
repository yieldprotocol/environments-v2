import { ethers } from 'hardhat'
import { ACCUMULATOR, CHAINLINKUSD } from '../../../../shared/constants'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { IOracle } from '../../../../typechain'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { makeBaseProposal } from '../../../fragments/assetsAndSeries/makeBaseProposal'
import { makeIlkProposal } from '../../../fragments/assetsAndSeries/makeIlkProposal'
import { orchestrateJoinProposal } from '../../../fragments/assetsAndSeries/orchestrateJoinProposal'

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

  const chainlinkUSDOracle = await ethers.getContractAt(
    'ChainlinkUSDMultiOracle',
    protocol.get(CHAINLINKUSD) as string,
    ownerAcc
  )
  const accumulatorOracle = await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol.get(ACCUMULATOR) as string,
    ownerAcc
  )
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

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
