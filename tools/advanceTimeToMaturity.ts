import { advanceTimeTo } from '../shared/helpers'
import { EOMAR23 } from '../shared/constants'

/**
 * @dev This script advances time to maturity
 */
;(async () => {
  await advanceTimeTo(EOMAR23 + 1)
})()
