import { readProposalFrom } from '../../../../shared/helpers'
import * as base_config from '../../base.mainnet.config'

export const protocol: Map<string, string> = base_config.protocol
export const governance: Map<string, string> = base_config.governance

export const previousProposalHash: string = readProposalFrom(process.env.HERE + '/../addDevelopers/proposal.txt')[0]

export const executorsRevoked: string[] = [
  '0x05950b4e68f103d5aBEf20364dE219a247e59C23', // Bruno Bonnano
  '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497', // Egill Hreinsson
]

export const developer = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
