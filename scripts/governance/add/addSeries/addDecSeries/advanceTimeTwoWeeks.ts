import { advanceTime } from '../../../../../shared/helpers'

/**
 * @dev This script advances time until maturity of the first strategy
 */
;(async () => {
  await advanceTime(14 * 24 * 60 * 60)
})()
