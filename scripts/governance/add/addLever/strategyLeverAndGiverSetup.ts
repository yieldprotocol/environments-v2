import { ethers } from 'hardhat'
import { Timelock, Giver, YieldStrategyLever, Cauldron } from '../../../../typechain'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { orchestrateLeverProposal } from '../../../fragments/utils/orchestrateLeverProposal'
import { orchestrateGiverProposal } from '../../../fragments/utils/orchestrateGiverProposal'
import { setFlashFeeOnJoinProposal } from '../../../fragments/setFlashFeeOnJoinProposal'
import { setFlashFeeOnFytokenProposal } from '../../../fragments/setFlashFeeOnFyTokenProposal'
import { TIMELOCK } from '../../../../shared/constants'

const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance, joinFlashFees, fyTokenFlashFees } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the YieldStrategyLever, Giver and sets flashfeefactor on joins and fyTokens
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = (await ethers.getContractAt('Timelock', governance.get(TIMELOCK) as string, ownerAcc)) as Timelock
  const giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as Giver
  const yieldStrategyLever = (await ethers.getContractAt(
    'YieldStrategyLever',
    protocol.get('yieldStrategyLever') as string,
    ownerAcc
  )) as YieldStrategyLever
  const cauldron = (await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)) as Cauldron

  let proposal: Array<{ target: string; data: string }> = await orchestrateLeverProposal(yieldStrategyLever, giver)
  proposal = proposal.concat(await orchestrateGiverProposal(giver, cauldron, timelock, deployer))
  proposal = proposal.concat(await setFlashFeeOnJoinProposal(joinFlashFees))
  proposal = proposal.concat(await setFlashFeeOnFytokenProposal(fyTokenFlashFees))
  await propose(timelock, proposal, developer)
})()
