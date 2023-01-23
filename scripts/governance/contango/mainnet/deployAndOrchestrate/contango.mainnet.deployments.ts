import {
  CONTANGO,
  CONTANGO_CAULDRON,
  CONTANGO_LADLE,
  CONTANGO_WITCH,
  ETH,
  POOL_ORACLE,
  secondsInOneHour,
  secondsInOneMinute,
  YIELD_SPACE_MULTI_ORACLE,
} from '../../../../../shared/constants'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import { SERIES_ARBITRUM } from '../../../../../shared/typed-constants'
import * as base_config from '../../../base.mainnet.config'
import { ContractDeployment } from '../../../confTypes' // Note we use the series id as the asset id

export const developer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'
export const deployer: string = '0x05950b4e68f103d5aBEf20364dE219a247e59C23'

export const governance: Map<string, string> = base_config.governance
const assets: Map<string, string> = base_config.assets
const protocolAddresses = 'protocol.json'
const protocol = () => readAddressMappingIfExists(protocolAddresses)
const external = () => readAddressMappingIfExists('external.json')
const fyTokens = () => readAddressMappingIfExists('fyTokens.json')

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: protocolAddresses,
    name: CONTANGO_CAULDRON,
    contract: 'Cauldron',
    args: [],
  },
  {
    addressFile: protocolAddresses,
    name: CONTANGO_LADLE,
    contract: 'ContangoLadle',
    args: [() => protocol().getOrThrow(CONTANGO_CAULDRON), () => assets.getOrThrow(ETH)],
  },
  {
    addressFile: protocolAddresses,
    name: CONTANGO_WITCH,
    contract: 'ContangoWitch',
    args: [
      () => external().getOrThrow(CONTANGO),
      () => protocol().getOrThrow(CONTANGO_CAULDRON),
      () => protocol().getOrThrow(CONTANGO_LADLE),
    ],
  },
  {
    addressFile: protocolAddresses,
    name: POOL_ORACLE,
    contract: 'PoolOracle',
    args: [() => 24 * secondsInOneHour, () => 24, () => 5 * secondsInOneMinute],
  },
  {
    addressFile: protocolAddresses,
    name: YIELD_SPACE_MULTI_ORACLE,
    contract: 'YieldSpaceMultiOracle',
    args: [() => protocol().getOrThrow(POOL_ORACLE)],
  },
  ...SERIES_ARBITRUM.map(({ bytes: series }) => ({
    addressFile: 'joins.json',
    name: series,
    contract: 'Join',
    args: [() => fyTokens().getOrThrow(series)],
  })),
]
