import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import { ContractDeployment } from '../../../confTypes'
import { NEW_SERIES_ARBITRUM } from '../../contango-seed-config'

export const deployer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'

export const governance = readAddressMappingIfExists('governance.json')
const fyTokens = () => readAddressMappingIfExists('fyTokens.json')
const protocol = () => readAddressMappingIfExists('protocol.json')

export const contractDeployments: ContractDeployment[] = NEW_SERIES_ARBITRUM.map(({ bytes: series }) => ({
  addressFile: 'joins.json',
  name: series,
  contract: 'Join',
  args: [() => fyTokens().getOrThrow(series)],
}))
