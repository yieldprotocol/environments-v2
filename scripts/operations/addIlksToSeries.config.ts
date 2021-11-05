import { stringToBytes6 } from '../../shared/helpers'
import { WSTETH } from '../../shared/constants'

export const newSeriesIlks: Array<[string, string[]]> = [
  [stringToBytes6('0104'), [WSTETH]],
  [stringToBytes6('0105'), [WSTETH]],
  [stringToBytes6('0204'), [WSTETH]],
  [stringToBytes6('0205'), [WSTETH]],
]