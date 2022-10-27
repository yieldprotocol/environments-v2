import {
  CONTANGO_CAULDRON,
  CONTANGO_LADLE,
  CONTANGO_WITCH,
  FYDAI2303,
  FYETH2303,
  FYFRAX2303,
  FYUSDC2303,
  POOL_ORACLE,
  secondsInOneHour,
  secondsInOneMinute,
  YIELD_SPACE_MULTI_ORACLE,
  ETH,
} from '../../../../../shared/constants'
import { ContractDeployment } from '../../../confTypes' // Note we use the series id as the asset id
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import * as base_config from '../../../base.mainnet.config'

export const developer: string = '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497'
export const deployer: string = '0x02f73B54ccfBA5c91bf432087D60e4b3a781E497'

export const governance: Map<string, string> = base_config.governance
const assets: Map<string, string> = base_config.assets
const external = () => readAddressMappingIfExists('external.json')
const protocol = () => readAddressMappingIfExists('protocol.json')
const fyTokens = () => readAddressMappingIfExists('fyTokens.json')

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'protocol.json',
    name: CONTANGO_CAULDRON,
    contract: 'Cauldron',
    args: [],
  },
  {
    addressFile: 'protocol.json',
    name: CONTANGO_LADLE,
    contract: 'ContangoLadle',
    args: [() => protocol().getOrThrow(CONTANGO_CAULDRON), () => assets.getOrThrow(ETH)],
  },
  {
    addressFile: 'protocol.json',
    name: CONTANGO_WITCH,
    contract: 'ContangoWitch',
    args: [
      () => external().getOrThrow('contango'),
      () => protocol().getOrThrow(CONTANGO_CAULDRON),
      () => protocol().getOrThrow(CONTANGO_LADLE),
    ],
  },
  {
    addressFile: 'protocol.json',
    name: POOL_ORACLE,
    contract: 'PoolOracle',
    args: [() => 24 * secondsInOneHour, () => 24, () => 5 * secondsInOneMinute],
  },
  {
    addressFile: 'protocol.json',
    name: YIELD_SPACE_MULTI_ORACLE,
    contract: 'YieldSpaceMultiOracle',
    args: [() => protocol().getOrThrow(POOL_ORACLE)],
  },
  {
    addressFile: 'joins.json',
    name: FYDAI2303,
    contract: 'Join',
    args: [() => fyTokens().getOrThrow(FYDAI2303)],
  },
  {
    addressFile: 'joins.json',
    name: FYFRAX2303,
    contract: 'Join',
    args: [() => fyTokens().getOrThrow(FYFRAX2303)],
  },
  {
    addressFile: 'joins.json',
    name: FYUSDC2303,
    contract: 'Join',
    args: [() => fyTokens().getOrThrow(FYUSDC2303)],
  },
  {
    addressFile: 'joins.json',
    name: FYETH2303,
    contract: 'Join',
    args: [() => fyTokens().getOrThrow(FYETH2303)],
  },
]
