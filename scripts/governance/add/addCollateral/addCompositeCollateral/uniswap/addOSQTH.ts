import { CAULDRON, CLOAK, LADLE, TIMELOCK, WITCH, UNISWAP } from '../../../../../../shared/constants'
import { getOwnerOrImpersonate, propose, readAddressMappingIfExists } from '../../../../../../shared/helpers'
import {
  Cauldron__factory,
  Ladle__factory,
  Join__factory,
  Timelock__factory,
  EmergencyBrake__factory,
  Witch__factory,
  UniswapV3Oracle__factory,
} from '../../../../../../typechain'

import { addIlk } from '../../../../../fragments/assetsAndSeries/addIlk'
import { updateUniswapSources } from '../../../../../fragments/oracles/updateUniswapSources'
import { grantRoot } from '../../../../../fragments/permissions/grantRoot'

const { developer, ilk, protocol, governance, joins, series, uniswapsources } = require(process.env.CONF!)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const witch = Witch__factory.connect(protocol().getOrThrow(WITCH)!, ownerAcc)
  const uniswapOracle = UniswapV3Oracle__factory.connect(protocol().getOrThrow(UNISWAP)!, ownerAcc)
  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Asset
  proposal = proposal.concat(await updateUniswapSources(uniswapOracle, uniswapsources))
  proposal = proposal.concat(await grantRoot(ownerAcc, cloak.address, [joins.getOrThrow(ilk.asset.assetId)]))
  proposal = proposal.concat(await addIlk(ownerAcc, cloak, cauldron, ladle, witch, series, ilk, joins))
  await propose(timelock, proposal, developer)
})()
