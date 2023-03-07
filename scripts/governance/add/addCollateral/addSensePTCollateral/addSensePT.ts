import { CAULDRON, CLOAK, IDENTITY_ORACLE, LADLE, TIMELOCK, WITCH } from '../../../../../shared/constants'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import {
  Cauldron__factory,
  Ladle__factory,
  Timelock__factory,
  EmergencyBrake__factory,
  Witch__factory,
  Join__factory,
  IdentityOracle__factory,
} from '../../../../../typechain'
import { addAsset } from '../../../../fragments/assetsAndSeries/addAsset'
import { addIlkToSeries } from '../../../../fragments/assetsAndSeries/addIlkToSeries'
import { makeIlk } from '../../../../fragments/assetsAndSeries/makeIlk'
import { orchestrateJoin } from '../../../../fragments/assetsAndSeries/orchestrateJoin'
import { orchestrateIdentityOracle } from '../../../../fragments/oracles/orchestrateIdentityOracle'
import { updateIdentityOracleSources } from '../../../../fragments/oracles/updateIdentityOracleSources'

const {
  developer,
  deployers,
  ilks,
  assetsToAdd,
  protocol,
  governance,
  joins,
  newSeries,
  identityOracleSources,
} = require(process.env.CONF!)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)
  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE)!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const witch = Witch__factory.connect(protocol().getOrThrow(WITCH)!, ownerAcc)
  const identityOracle = IdentityOracle__factory.connect(protocol().getOrThrow(IDENTITY_ORACLE)!, ownerAcc)
  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(
    await orchestrateIdentityOracle(deployers.getOrThrow(IDENTITY_ORACLE), identityOracle, timelock, cloak)
  )
  proposal = proposal.concat(await updateIdentityOracleSources(identityOracle, identityOracleSources))

  for (let asset of assetsToAdd) {
    proposal = proposal.concat(
      await orchestrateJoin(
        deployers.getOrThrow(joins.getOrThrow(asset.assetId)),
        timelock,
        cloak,
        Join__factory.connect(joins.getOrThrow(asset.assetId), ownerAcc)
      )
    )
    proposal = proposal.concat(await addAsset(ownerAcc, cloak, cauldron, ladle, asset, joins))
  }

  for (let ilk of ilks) {
    proposal = proposal.concat(await makeIlk(ownerAcc, cloak, cauldron, witch, ilk, joins))
  }
  // Add ilk to series Series
  for (let series of newSeries) {
    for (let ilk of series.ilks) {
      proposal = proposal.concat(await addIlkToSeries(cauldron, series, ilk))
    }
  }
  if (proposal.length > 0) await propose(timelock, proposal, developer)
})()
