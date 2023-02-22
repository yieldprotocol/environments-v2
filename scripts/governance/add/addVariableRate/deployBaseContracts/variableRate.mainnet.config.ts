import { VR_CAULDRON, VR_LADLE, VR_WITCH } from '../../../../../shared/constants'
import { ContractDeployment } from '../../../confTypes'
import * as base_config from '../../../base.mainnet.config'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'

export const assets: Map<string, string> = base_config.assets
export const developer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const deployer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const governance: Map<string, string> = base_config.governance
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const joins: Map<string, string> = base_config.joins
export const deployers: Map<string, string> = base_config.deployers
export const whales: Map<string, string> = base_config.whales

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: VR_CAULDRON,
    contract: 'VRCauldron',
    args: [],
  },
  {
    addressFile: 'protocol.json',
    name: VR_LADLE,
    contract: 'VRLadle',
    args: [() => protocol().getOrThrow(VR_CAULDRON)!],
  },
  {
    addressFile: 'protocol.json',
    name: VR_WITCH,
    contract: 'VRWITCH',
    args: [() => protocol().getOrThrow(VR_CAULDRON)!, () => protocol().getOrThrow(VR_LADLE)!],
  },
]
