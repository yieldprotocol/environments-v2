import {
  ACCUMULATOR,
  CHAINLINK,
  DAI,
  ETH,
  FRAX,
  RATE,
  TIMELOCK,
  USDC,
  VR_CAULDRON,
  VR_CAULDRON_IMPLEMENTATION,
  VR_LADLE,
  VR_LADLE_IMPLEMENTATION,
  VR_ROUTER,
  VR_WITCH,
  VR_WITCH_IMPLEMENTATION,
  VYDAI,
  VYDAI_IMPLEMENTATION,
  VYETH,
  VYETH_IMPLEMENTATION,
  VYFRAX,
  VYFRAX_IMPLEMENTATION,
  VYUSDC,
  VYUSDC_IMPLEMENTATION,
  WAD,
} from '../../../../../shared/constants'
import { Accumulator, Asset, Base, ContractDeployment, Ilk } from '../../../confTypes'
import * as base_config from '../../../base.mainnet.config'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import { parseUnits } from 'ethers/lib/utils'
import { VRCauldron__factory, VRLadle__factory, VRWitch__factory, VYToken__factory } from '../../../../../typechain'

export const assets: Map<string, string> = base_config.assets
export const developer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const deployer: string = '0x06FB6f89eAA936d4Cfe58FfA071cf8EAe17ac9AB'
export const governance: Map<string, string> = base_config.governance
export const protocol = () => readAddressMappingIfExists('protocol.json')
export const joins = readAddressMappingIfExists('vyJoins.json')
export const deployers: Map<string, string> = base_config.deployers
export const whales: Map<string, string> = base_config.whales
export const vyTokens: Map<string, string> = base_config.vyTokens

export const contractDeployments: ContractDeployment[] = [
  {
    addressFile: 'vyJoins.json',
    name: ETH,
    contract: 'Join',
    args: [() => assets.getOrThrow(ETH)!],
  },
  {
    addressFile: 'vyJoins.json',
    name: DAI,
    contract: 'Join',
    args: [() => assets.getOrThrow(DAI)!],
  },
  {
    addressFile: 'vyJoins.json',
    name: USDC,
    contract: 'Join',
    args: [() => assets.getOrThrow(USDC)!],
  },
  {
    addressFile: 'vyJoins.json',
    name: FRAX,
    contract: 'Join',
    args: [() => assets.getOrThrow(FRAX)!],
  },
  {
    addressFile: 'protocol.json',
    name: VR_CAULDRON_IMPLEMENTATION,
    contract: 'VRCauldron',
    args: [],
  },
  {
    addressFile: 'protocol.json',
    name: VR_CAULDRON,
    contract: 'ERC1967Proxy',
    args: [
      () => protocol().getOrThrow(VR_CAULDRON_IMPLEMENTATION)!,
      () => VRCauldron__factory.createInterface().encodeFunctionData('initialize', [governance.getOrThrow(TIMELOCK)!]),
    ],
  },
  {
    addressFile: 'protocol.json',
    name: VR_ROUTER,
    contract: 'VRRouter',
    args: [],
  },
  {
    addressFile: 'protocol.json',
    name: VR_LADLE_IMPLEMENTATION,
    contract: 'VRLadle',
    args: [
      () => protocol().getOrThrow(VR_CAULDRON)!,
      () => protocol().getOrThrow(VR_ROUTER)!,
      () => assets.getOrThrow(ETH)!,
    ],
  },
  {
    addressFile: 'protocol.json',
    name: VR_LADLE,
    contract: 'ERC1967Proxy',
    args: [
      () => protocol().getOrThrow(VR_LADLE_IMPLEMENTATION)!,
      () => VRLadle__factory.createInterface().encodeFunctionData('initialize', [governance.getOrThrow(TIMELOCK)!]),
    ],
  },
  {
    addressFile: 'protocol.json',
    name: VR_WITCH_IMPLEMENTATION,
    contract: 'VRWitch',
    args: [() => protocol().getOrThrow(VR_CAULDRON)!, () => protocol().getOrThrow(VR_LADLE)!],
  },
  {
    addressFile: 'protocol.json',
    name: VR_WITCH,
    contract: 'ERC1967Proxy',
    args: [
      () => protocol().getOrThrow(VR_WITCH_IMPLEMENTATION)!,
      () =>
        VRWitch__factory.createInterface().encodeFunctionData('initialize', [
          protocol().getOrThrow(VR_LADLE),
          governance.getOrThrow(TIMELOCK)!,
        ]),
    ],
  },
  {
    addressFile: 'vyTokens.json',
    name: VYETH_IMPLEMENTATION,
    contract: 'VYToken',
    args: [
      () => ETH,
      () => protocol().getOrThrow(ACCUMULATOR)!,
      () => joins.getOrThrow(ETH)!,
      () => 'Variable Yield ETH',
      () => 'vyETH',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
  {
    addressFile: 'vyTokens.json',
    name: VYETH,
    contract: 'ERC1967Proxy',
    args: [
      () => vyTokens.getOrThrow(VYETH_IMPLEMENTATION)!,
      () => VYToken__factory.createInterface().encodeFunctionData('initialize', [governance.getOrThrow(TIMELOCK)!]),
    ],
  },
  {
    addressFile: 'vyTokens.json',
    name: VYDAI_IMPLEMENTATION,
    contract: 'VYToken',
    args: [
      () => DAI,
      () => protocol().getOrThrow(ACCUMULATOR)!,
      () => joins.getOrThrow(DAI),
      () => 'Variable Yield DAI',
      () => 'vyDAI',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
  {
    addressFile: 'vyTokens.json',
    name: VYDAI,
    contract: 'ERC1967Proxy',
    args: [
      () => vyTokens.getOrThrow(VYDAI_IMPLEMENTATION)!,
      () => VYToken__factory.createInterface().encodeFunctionData('initialize', [governance.getOrThrow(TIMELOCK)!]),
    ],
  },
  {
    addressFile: 'vyTokens.json',
    name: VYUSDC_IMPLEMENTATION,
    contract: 'VYToken',
    args: [
      () => USDC,
      () => protocol().getOrThrow(ACCUMULATOR)!,
      () => joins.getOrThrow(USDC),
      () => 'Variable Yield USDC',
      () => 'vyUSDC',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
  {
    addressFile: 'vyTokens.json',
    name: VYUSDC,
    contract: 'ERC1967Proxy',
    args: [
      () => vyTokens.getOrThrow(VYUSDC_IMPLEMENTATION)!,
      () => VYToken__factory.createInterface().encodeFunctionData('initialize', [governance.getOrThrow(TIMELOCK)!]),
    ],
  },
  {
    addressFile: 'vyTokens.json',
    name: VYFRAX_IMPLEMENTATION,
    contract: 'VYToken',
    args: [
      () => FRAX,
      () => protocol().getOrThrow(ACCUMULATOR)!,
      () => joins.getOrThrow(FRAX),
      () => 'Variable Yield FRAX',
      () => 'vyFRAX',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
  {
    addressFile: 'vyTokens.json',
    name: VYFRAX,
    contract: 'ERC1967Proxy',
    args: [
      () => vyTokens.getOrThrow(VYFRAX_IMPLEMENTATION)!,
      () => VYToken__factory.createInterface().encodeFunctionData('initialize', [governance.getOrThrow(TIMELOCK)!]),
    ],
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

export const vyTokensToAdd = [VYETH, VYDAI, VYUSDC, VYFRAX]
