import {
  ACCUMULATOR,
  CHAINLINK,
  DAI,
  ETH,
  FRAX,
  RATE,
  USDC,
  VR_CAULDRON,
  VR_LADLE,
  VR_WITCH,
  WAD,
} from '../../../../../shared/constants'
import { Accumulator, Asset, Base, ContractDeployment, Ilk } from '../../../confTypes'
import * as base_config from '../../../base.mainnet.config'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import { parseUnits } from 'ethers/lib/utils'

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
    args: [() => protocol().getOrThrow(VR_CAULDRON)!, () => assets.getOrThrow(ETH)!],
  },
  {
    addressFile: 'protocol.json',
    name: VR_WITCH,
    contract: 'VRWitch',
    args: [() => protocol().getOrThrow(VR_CAULDRON)!, () => protocol().getOrThrow(VR_LADLE)!],
  },
]

export const assetsToAdd: Asset[] = [
  {
    assetId: ETH,
    address: assets.getOrThrow(ETH),
  },
  {
    assetId: DAI,
    address: assets.getOrThrow(DAI),
  },
  {
    assetId: USDC,
    address: assets.getOrThrow(USDC),
  },
  {
    assetId: FRAX,
    address: assets.getOrThrow(FRAX),
  },
]

export const basesToAdd: Base[] = [
  {
    assetId: ETH,
    address: assets.getOrThrow(ETH),
    rateOracle: protocol().getOrThrow(ACCUMULATOR)! as string,
  },
  {
    assetId: DAI,
    address: assets.getOrThrow(DAI),
    rateOracle: protocol().getOrThrow(ACCUMULATOR)! as string,
  },
]

export const accumulatorSources: Accumulator[] = [
  {
    baseId: ETH,
    kind: RATE,
    startRate: WAD,
    perSecondRate: WAD,
  },
  {
    baseId: DAI,
    kind: RATE,
    startRate: WAD,
    perSecondRate: WAD,
  },
  {
    baseId: FRAX,
    kind: RATE,
    startRate: WAD,
    perSecondRate: WAD,
  },
  {
    baseId: USDC,
    kind: RATE,
    startRate: WAD,
    perSecondRate: WAD,
  },
]

export const ilks: Ilk[] = [
  {
    baseId: ETH,
    ilkId: ETH,
    asset: assetsToAdd[0],
    collateralization: {
      baseId: ETH,
      ilkId: ETH,
      oracle: protocol().getOrThrow(CHAINLINK)! as string,
      ratio: 1000000,
    },
    debtLimits: {
      baseId: ETH,
      ilkId: ETH,
      line: 150,
      dust: 1,
      dec: 18,
    },
  },
  {
    baseId: ETH,
    ilkId: DAI,
    asset: assetsToAdd[1],
    collateralization: {
      baseId: ETH,
      ilkId: DAI,
      oracle: protocol().getOrThrow(CHAINLINK)! as string,
      ratio: 1330000,
    },
    debtLimits: {
      baseId: ETH,
      ilkId: DAI,
      line: 150,
      dust: 1,
      dec: 18,
    },
    auctionLineAndLimit: {
      baseId: ETH,
      ilkId: DAI,
      duration: 3600,
      vaultProportion: parseUnits('0.5'),
      collateralProportion: parseUnits('0.78947368'), // 105 / 133
      max: parseUnits('1000'),
    },
  },
]
