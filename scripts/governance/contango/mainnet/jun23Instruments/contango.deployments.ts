import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import { SERIES_MAINNET } from '../../contango-seed-config'
import { ContractDeployment } from '../../../confTypes'

export const deployer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'

export const governance = readAddressMappingIfExists('governance.json')
const fyTokens = () => readAddressMappingIfExists('fyTokens.json')

export const contractDeployments: ContractDeployment[] = SERIES_MAINNET.map(({ bytes: series }) => ({
  addressFile: 'joins.json',
  name: series,
  contract: 'Join',
  args: [() => fyTokens().getOrThrow(series)],
}))
