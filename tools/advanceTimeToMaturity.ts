import { advanceTimeTo } from '../shared/helpers'
import { EODEC22 } from '../shared/constants'

/**
 * @dev This script advances time to maturity
 */
;(async () => {
  await advanceTimeTo(EODEC22 + 1)
})()
