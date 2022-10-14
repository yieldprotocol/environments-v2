import { advanceTime } from '../shared/helpers'

/**
 * @dev This script advances time three days
 */
;(async () => {
  await advanceTime(3 * 24 * 60 * 60)
})()
