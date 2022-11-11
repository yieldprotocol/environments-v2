import { Timelock__factory, Cauldron__factory, Giver__factory } from '../../../../../typechain'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import { orchestrateGiverProposal } from '../../../../fragments/utils/orchestrateGiverProposal'
import { TIMELOCK, CAULDRON, GIVER } from '../../../../../shared/constants'

const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the YieldStrategyLever, Giver and sets flashfeefactor on joins and fyTokens
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const giver = Giver__factory.connect(protocol().getOrThrow(GIVER), ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON), ownerAcc)

  let proposal: Array<{ target: string; data: string }> = await orchestrateGiverProposal(
    giver,
    cauldron,
    timelock,
    deployer
  )
  await propose(timelock, proposal, developer)
})()
