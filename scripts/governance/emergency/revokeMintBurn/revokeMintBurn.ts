import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { Timelock__factory, EmergencyBrake__factory, FYToken__factory } from '../../../../typechain'
import { TIMELOCK, CLOAK, LADLE } from '../../../../shared/constants'
import {
  FYETH2303,
  FYDAI2303,
  FYUSDC2303,
  FYUSDT2303,
  FYETH2306,
  FYDAI2306,
  FYUSDC2306,
  FYUSDT2306,
} from '../../../../shared/constants'
import { removeFYToken } from '../../../fragments/ladle/removeFYToken'

const { developer, governance, protocol, fyTokens } = require(process.env.CONF as string)

/**
 * @dev This script removes 'fyToken.mint' and 'fyToken.burn' permissions from the Ladle
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get(CLOAK)!, ownerAcc)
  const ladleAddress = protocol.get(LADLE)!

  const fyTokenIdsToIsolate = [
    FYETH2303,
    FYDAI2303,
    FYUSDC2303,
    FYUSDT2303,
    FYETH2306,
    FYDAI2306,
    FYUSDC2306,
    FYUSDT2306,
  ]

  let proposal: Array<{ target: string; data: string }> = []

  for (let fyTokenId of fyTokenIdsToIsolate) {
    const fyToken = FYToken__factory.connect(fyTokens.getOrThrow(fyTokenId)!, ownerAcc)
    proposal = proposal.concat(await removeFYToken(cloak, ladleAddress, fyTokenId, fyToken))
  }

  await propose(timelock, proposal, developer)
})()
