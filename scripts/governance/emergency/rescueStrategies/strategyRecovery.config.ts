import { LADLE, STRATEGY_RESCUE } from '../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../shared/helpers'
import * as base_config from '../../base.mainnet.config'
import { ContractDeployment } from '../../confTypes'

export const developer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const deployer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const whales: Map<string, string> = base_config.whales
export const governance: Map<string, string> = base_config.governance
export const joins: Map<string, string> = base_config.joins
export const fyTokens: Map<string, string> = base_config.fyTokens
export const protocol = () => readAddressMappingIfExists('protocol.json')

// ----- deployment parameters -----
export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: STRATEGY_RESCUE,
    contract: 'StrategyRescue',
    args: [() => protocol().getOrThrow(LADLE)],
  },
]

export const strategiesToRecover: Array<{ underlyingId: string; strategy: string }> = [
  { underlyingId: '0x303000000000', strategy: '0x51D2fCCcC9003f0743bfAa4E495cda5BBA749283' },
  { underlyingId: '0x303000000000', strategy: '0xFcFc74fA508450C8Ff681E6894Ab2C9852bD32a7' },
  { underlyingId: '0x303100000000', strategy: '0x2008E463c4d0364763569dFE16cdF4E6F29bCe8E' },
  { underlyingId: '0x303100000000', strategy: '0x742b05A7AF59C31576E4f31B092Caff580B162C3' },
  { underlyingId: '0x303200000000', strategy: '0x85fA3071AD36d12603176C12118d25602D2229aB' },
  { underlyingId: '0x303200000000', strategy: '0x3e63834310D771d6157706c37778FB1B53eAf6F2' },
]
