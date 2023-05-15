import {
  ACCUMULATOR,
  CHAINLINKUSD,
  CHI,
  DAI,
  ETH,
  USDT,
  RATE,
  TIMELOCK,
  USDC,
  VARIABLE_RATE_ORACLE,
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
  VYUSDT,
  VYUSDT_IMPLEMENTATION,
  VYUSDC,
  VYUSDC_IMPLEMENTATION,
  WAD,
  ONEUSDC,
} from '../../../../../shared/constants'
import { Accumulator, Asset, Base, ContractDeployment, Ilk, VariableInterestRateOracleSource } from '../../../confTypes'
import * as base_config from '../../../base.arb_mainnet.config'
import { readAddressMappingIfExists } from '../../../../../shared/helpers'
import { parseUnits } from 'ethers/lib/utils'
import { VRCauldron__factory, VRLadle__factory, VRWitch__factory, VYToken__factory } from '../../../../../typechain'
import { BigNumber } from 'ethers/lib/ethers'

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
    name: USDT,
    contract: 'Join',
    args: [() => assets.getOrThrow(USDT)!],
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
    addressFile: 'protocol.json',
    name: VARIABLE_RATE_ORACLE,
    contract: 'VariableInterestRateOracle',
    args: [() => protocol().getOrThrow(VR_CAULDRON)!, () => protocol().getOrThrow(VR_LADLE)!],
  },
  {
    addressFile: 'vyTokens.json',
    name: VYETH_IMPLEMENTATION,
    contract: 'VYToken',
    args: [
      () => ETH,
      () => protocol().getOrThrow(VARIABLE_RATE_ORACLE)!,
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
      () =>
        VYToken__factory.createInterface().encodeFunctionData('initialize', [
          governance.getOrThrow(TIMELOCK)!,
          'VYETH',
          'VYETH',
          18,
        ]),
    ],
  },
  {
    addressFile: 'vyTokens.json',
    name: VYDAI_IMPLEMENTATION,
    contract: 'VYToken',
    args: [
      () => DAI,
      () => protocol().getOrThrow(VARIABLE_RATE_ORACLE)!,
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
      () =>
        VYToken__factory.createInterface().encodeFunctionData('initialize', [
          governance.getOrThrow(TIMELOCK)!,
          'VYDAI',
          'VYDAI',
          18,
        ]),
    ],
  },
  {
    addressFile: 'vyTokens.json',
    name: VYUSDC_IMPLEMENTATION,
    contract: 'VYToken',
    args: [
      () => USDC,
      () => protocol().getOrThrow(VARIABLE_RATE_ORACLE)!,
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
      () =>
        VYToken__factory.createInterface().encodeFunctionData('initialize', [
          governance.getOrThrow(TIMELOCK)!,
          'VYUSDC',
          'VYUSDC',
          6,
        ]),
    ],
  },
  {
    addressFile: 'vyTokens.json',
    name: VYUSDT_IMPLEMENTATION,
    contract: 'VYToken',
    args: [
      () => USDT,
      () => protocol().getOrThrow(VARIABLE_RATE_ORACLE)!,
      () => joins.getOrThrow(USDT),
      () => 'Variable Yield USDT',
      () => 'vyUSDT',
    ],
    libs: {
      SafeERC20Namer: protocol().getOrThrow('safeERC20Namer')!,
    },
  },
  {
    addressFile: 'vyTokens.json',
    name: VYUSDT,
    contract: 'ERC1967Proxy',
    args: [
      () => vyTokens.getOrThrow(VYUSDT_IMPLEMENTATION)!,
      () =>
        VYToken__factory.createInterface().encodeFunctionData('initialize', [
          governance.getOrThrow(TIMELOCK)!,
          'YVUSDT',
          'VYUSDT',
          18,
        ]),
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
    assetId: USDT,
    address: assets.getOrThrow(USDT),
  },
]

export const basesToAdd: Base[] = [
  {
    assetId: ETH,
    address: assets.getOrThrow(ETH),
    rateOracle: protocol().getOrThrow(VARIABLE_RATE_ORACLE)! as string,
  },
  {
    assetId: DAI,
    address: assets.getOrThrow(DAI),
    rateOracle: protocol().getOrThrow(VARIABLE_RATE_ORACLE)! as string,
  },
  {
    assetId: USDC,
    address: assets.getOrThrow(USDC),
    rateOracle: protocol().getOrThrow(VARIABLE_RATE_ORACLE)! as string,
  },
  {
    assetId: USDT,
    address: assets.getOrThrow(USDT),
    rateOracle: protocol().getOrThrow(VARIABLE_RATE_ORACLE)! as string,
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
    baseId: USDT,
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

export const variableInterestRateOracleSources: VariableInterestRateOracleSource[] = [
  {
    baseId: ETH,
    kind: RATE,
    optimalUsageRate: BigNumber.from('450000'),
    accumulated: BigNumber.from('1000000000000000000'),
    baseVariableBorrowRate: BigNumber.from('0'),
    slope1: BigNumber.from('40000'),
    slope2: BigNumber.from('3000000'),
    ilks: [DAI, USDC, USDT],
  },
  {
    baseId: ETH,
    kind: CHI,
    optimalUsageRate: BigNumber.from('450000'),
    accumulated: BigNumber.from('1000000000000000000'),
    baseVariableBorrowRate: BigNumber.from('0'),
    slope1: BigNumber.from('40000'),
    slope2: BigNumber.from('3000000'),
    ilks: [DAI, USDC, USDT],
  },
  {
    baseId: DAI,
    kind: RATE,
    optimalUsageRate: BigNumber.from('900000'),
    accumulated: BigNumber.from('1000000000000000000'),
    baseVariableBorrowRate: BigNumber.from('0'),
    slope1: BigNumber.from('40000'),
    slope2: BigNumber.from('600000'),
    ilks: [ETH, USDT, USDC],
  },
  {
    baseId: DAI,
    kind: CHI,
    optimalUsageRate: BigNumber.from('900000'),
    accumulated: BigNumber.from('1000000000000000000'),
    baseVariableBorrowRate: BigNumber.from('0'),
    slope1: BigNumber.from('40000'),
    slope2: BigNumber.from('600000'),
    ilks: [ETH, USDT, USDC],
  },
  {
    baseId: USDC,
    kind: RATE,
    optimalUsageRate: BigNumber.from('900000'),
    accumulated: BigNumber.from('1000000000000000000'),
    baseVariableBorrowRate: BigNumber.from('0'),
    slope1: BigNumber.from('40000'),
    slope2: BigNumber.from('600000'),
    ilks: [ETH, DAI, USDT],
  },
  {
    baseId: USDC,
    kind: CHI,
    optimalUsageRate: BigNumber.from('900000'),
    accumulated: BigNumber.from('1000000000000000000'),
    baseVariableBorrowRate: BigNumber.from('0'),
    slope1: BigNumber.from('40000'),
    slope2: BigNumber.from('600000'),
    ilks: [ETH, DAI, USDT],
  },
  {
    baseId: USDT,
    kind: RATE,
    optimalUsageRate: BigNumber.from('900000'),
    accumulated: BigNumber.from('1000000000000000000'),
    baseVariableBorrowRate: BigNumber.from('0'),
    slope1: BigNumber.from('40000'),
    slope2: BigNumber.from('600000'),
    ilks: [ETH, DAI, USDC],
  },
  {
    baseId: USDT,
    kind: CHI,
    optimalUsageRate: BigNumber.from('900000'),
    accumulated: BigNumber.from('1000000000000000000'),
    baseVariableBorrowRate: BigNumber.from('0'),
    slope1: BigNumber.from('40000'),
    slope2: BigNumber.from('600000'),
    ilks: [ETH, DAI, USDC],
  },
]

export const ilks: Ilk[] = [
  {
    baseId: ETH,
    ilkId: DAI,
    asset: assetsToAdd[1],
    collateralization: {
      baseId: ETH,
      ilkId: DAI,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1400000,
    },
    debtLimits: {
      baseId: ETH,
      ilkId: DAI,
      line: 100000,
      dust: 100,
      dec: 18,
    },
    auctionLineAndLimit: {
      baseId: ETH,
      ilkId: DAI,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1400000),
      max: WAD.mul(100000), // $100k
    },
  },
  {
    baseId: ETH,
    ilkId: USDC,
    asset: assetsToAdd[1],
    collateralization: {
      baseId: ETH,
      ilkId: USDC,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1400000,
    },
    debtLimits: {
      baseId: ETH,
      ilkId: USDC,
      line: 100000,
      dust: 100,
      dec: 18,
    },
    auctionLineAndLimit: {
      baseId: ETH,
      ilkId: USDC,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1400000),
      max: WAD.mul(100000), // $100k
    },
  },
  //TODO: update this
  {
    baseId: ETH,
    ilkId: USDT,
    asset: assetsToAdd[1],
    collateralization: {
      baseId: ETH,
      ilkId: USDT,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1330000,
    },
    debtLimits: {
      baseId: ETH,
      ilkId: USDT,
      line: 150,
      dust: 1,
      dec: 18,
    },
    auctionLineAndLimit: {
      baseId: ETH,
      ilkId: USDT,
      duration: 3600,
      vaultProportion: parseUnits('0.5'),
      collateralProportion: parseUnits('0.78947368'), // 105 / 133
      max: parseUnits('1000'),
    },
  },
  {
    baseId: DAI,
    ilkId: USDC,
    asset: assetsToAdd[2],
    collateralization: {
      baseId: DAI,
      ilkId: USDC,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1100000,
    },
    debtLimits: {
      baseId: DAI,
      ilkId: USDC,
      line: 100000,
      dust: 100,
      dec: 18,
    },
    auctionLineAndLimit: {
      baseId: DAI,
      ilkId: USDC,
      duration: 3600,
      vaultProportion: WAD,
      collateralProportion: WAD.mul(1050000).div(1100000),
      max: ONEUSDC.mul(100000),
    },
  },
  //TODO: update this
  {
    baseId: DAI,
    ilkId: USDT,
    asset: assetsToAdd[1],
    collateralization: {
      baseId: DAI,
      ilkId: USDT,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1330000,
    },
    debtLimits: {
      baseId: DAI,
      ilkId: USDT,
      line: 150,
      dust: 1,
      dec: 18,
    },
    auctionLineAndLimit: {
      baseId: DAI,
      ilkId: USDT,
      duration: 3600,
      vaultProportion: parseUnits('0.5'),
      collateralProportion: parseUnits('0.78947368'), // 105 / 133
      max: parseUnits('1000'),
    },
  },
  {
    baseId: DAI,
    ilkId: ETH,
    asset: assetsToAdd[1],
    collateralization: {
      baseId: DAI,
      ilkId: ETH,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1400000,
    },
    debtLimits: {
      baseId: DAI,
      ilkId: ETH,
      line: 100000,
      dust: 100,
      dec: 18,
    },
    auctionLineAndLimit: {
      baseId: DAI,
      ilkId: ETH,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1400000),
      max: WAD.mul(100000), // $100k
    },
  },
  {
    baseId: USDC,
    ilkId: DAI,
    asset: assetsToAdd[2],
    collateralization: {
      baseId: USDC,
      ilkId: DAI,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1100000,
    },
    debtLimits: {
      baseId: USDC,
      ilkId: DAI,
      line: 100000,
      dust: 100,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDC,
      ilkId: DAI,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1400000),
      max: WAD.mul(100), // $100k
    },
  },
  //TODO: update this
  {
    baseId: USDC,
    ilkId: USDT,
    asset: assetsToAdd[1],
    collateralization: {
      baseId: USDC,
      ilkId: USDT,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1330000,
    },
    debtLimits: {
      baseId: USDC,
      ilkId: USDT,
      line: 150,
      dust: 1,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDC,
      ilkId: USDT,
      duration: 3600,
      vaultProportion: parseUnits('0.5'),
      collateralProportion: parseUnits('0.78947368'), // 105 / 133
      max: parseUnits('1000'),
    },
  },
  {
    baseId: USDC,
    ilkId: ETH,
    asset: assetsToAdd[1],
    collateralization: {
      baseId: USDC,
      ilkId: ETH,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1400000,
    },
    debtLimits: {
      baseId: USDC,
      ilkId: ETH,
      line: 100000,
      dust: 100,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDC,
      ilkId: ETH,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1400000),
      max: WAD.mul(100), // $100k
    },
  },
  {
    baseId: USDT,
    ilkId: USDC,
    asset: assetsToAdd[2],
    collateralization: {
      baseId: USDT,
      ilkId: USDC,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1100000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: USDC,
      line: 100000,
      dust: 100,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: USDC,
      duration: 3600,
      vaultProportion: WAD,
      collateralProportion: WAD.mul(1050000).div(1100000),
      max: base_config.ONEUSDT.mul(10000000),
    },
  },
  {
    baseId: USDT,
    ilkId: DAI,
    asset: assetsToAdd[1],
    collateralization: {
      baseId: USDT,
      ilkId: USDT,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1100000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: DAI,
      line: 100000,
      dust: 100,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: DAI,
      duration: 3600,
      vaultProportion: WAD,
      collateralProportion: WAD.mul(1050000).div(1100000),
      max: WAD.mul(10000000),
    },
  },
  {
    baseId: USDT,
    ilkId: ETH,
    asset: assetsToAdd[1],
    collateralization: {
      baseId: USDT,
      ilkId: ETH,
      oracle: protocol().getOrThrow(CHAINLINKUSD)!,
      ratio: 1400000,
    },
    debtLimits: {
      baseId: USDT,
      ilkId: ETH,
      line: 100000,
      dust: 100,
      dec: 6,
    },
    auctionLineAndLimit: {
      baseId: USDT,
      ilkId: ETH,
      duration: 3600,
      vaultProportion: WAD.div(2),
      collateralProportion: WAD.mul(1050000).div(1400000),
      max: WAD.mul(100), // $100k
    },
  },
]

export const vyTokensToAdd = [VYETH, VYDAI, VYUSDC, VYUSDT]
