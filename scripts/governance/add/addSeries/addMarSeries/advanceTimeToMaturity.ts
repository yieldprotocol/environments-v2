import { advanceTimeTo } from '../../../../../shared/helpers'
import { EOSEP22 } from '../../../../../shared/constants'

/**
 * @dev This script advances time to maturity
 */
;(async () => {
  await advanceTimeTo(EOSEP22 + 1)
})()
