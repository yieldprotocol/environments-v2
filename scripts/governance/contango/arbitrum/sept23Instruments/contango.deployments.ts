import { POOL_ORACLE, YIELD_SPACE_MULTI_ORACLE } from '../../../../../shared/constants'
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
})).concat([
  {
    addressFile: 'protocol.json',
    name: POOL_ORACLE,
    contract: 'PoolOracle',
    // 24 hours, 24, 5 minutes
    args: [() => (24 * 60 * 60) as any, () => 24, () => 5 * 60],
  },
  {
    addressFile: 'protocol.json',
    name: YIELD_SPACE_MULTI_ORACLE,
    contract: 'YieldSpaceMultiOracle',
    args: [() => protocol().getOrThrow(POOL_ORACLE)],
  },
])
