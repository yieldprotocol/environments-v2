import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import { updateCompositeSources } from '../../../fragments/oracles/updateCompositeSources'
import { updateCompositePaths } from '../../../fragments/oracles/updateCompositePaths'
import { updateCollateralization } from '../../../fragments/oracles/updateCollateralization'

import { COMPOSITE } from '../../../../shared/constants'
import { Timelock__factory, Cauldron__factory, CompositeMultiOracle__factory } from '../../../../typechain'

const { developer } = require(process.env.CONF as string)
const { protocol, governance, newCompositeSources, newCompositePaths, newSpotOracles } = require(process.env
  .CONF as string)
/**
 * @dev This script updates the oracles to enable the Solvency contract
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow('timelock') as string, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow('cauldron') as string, ownerAcc)
  const compositeOracle = CompositeMultiOracle__factory.connect(protocol.getOrThrow(COMPOSITE) as string, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await updateCompositeSources(compositeOracle, newCompositeSources))
  proposal = proposal.concat(await updateCompositePaths(compositeOracle, newCompositePaths))
  proposal = proposal.concat(await updateCollateralization(cauldron, newSpotOracles))

  await propose(timelock, proposal, developer)
})()
