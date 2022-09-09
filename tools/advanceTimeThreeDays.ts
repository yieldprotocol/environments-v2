import { advanceTime } from '../shared/helpers'

/**
 * @dev This script advances time three days to the future so that an approved proposal can be executed
 */
;(async () => {
  await advanceTime(3 * 24 * 60 * 60)
})()
