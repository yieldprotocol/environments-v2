import { CONTANGO_CAULDRON, CONTANGO_WITCH, TIMELOCK } from '../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import { Cauldron__factory, ContangoWitch__factory, Timelock__factory } from '../../../../../typechain'
import { updateCollateralization } from '../../../../fragments/oracles/updateCollateralization'
import { setLineAndLimit } from '../../../../fragments/witch/setLineAndLimit'
import { Ilk } from '../../../confTypes'

const { developer, protocol, governance, ilks } = require(process.env.CONF!)

/**
 * @dev This script configures the Yield Protocol to use fyTokens as collateral.
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CONTANGO_CAULDRON), ownerAcc)
  const witch = ContangoWitch__factory.connect(protocol.getOrThrow(CONTANGO_WITCH), ownerAcc)

  const crProposals = (ilks as Ilk[]).map(async (ilk) => updateCollateralization(cauldron, ilk.collateralization))
  const witchProposals = (ilks as Ilk[]).map(async (ilk) => setLineAndLimit(witch, ilk.auctionLineAndLimit!))

  const proposal = await (await Promise.all(crProposals.concat(witchProposals))).flat()

  await propose(Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc), proposal, ownerAcc.address)
})()
