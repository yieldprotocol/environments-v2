import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { getContract, readAddressMappingIfExists, verify, writeAddressMap } from '../../shared/helpers'
import { BigNumber } from 'ethers'

import { WAD, ZERO_ADDRESS } from '../../shared/constants'


import { Strategy } from '../../typechain/Strategy'
import { ERC20Mock } from '../../typechain/ERC20Mock'
import { DeployedContext, Proposal } from '../core/contexts'
import { Strategy__factory } from '../../typechain'


const STRATEGIES_FILE = 'strategies.json';

export class StrategyData {
  constructor(
    readonly name: string,
    readonly symbol: string,
    readonly baseId: string
  ) { }
}

export class StrategyInitData {
  constructor(
    readonly symbol: string,
    readonly startPoolId: string,
    readonly startSeriesId: string
  ) {}
}

export async function deployStrategy(ctx: DeployedContext, strategyData: StrategyData): Promise<Strategy> {
  const base = await getContract<ERC20Mock>(ctx.owner, 'ERC20Mock', await ctx.getRegisteredAssetAddress(strategyData.baseId)!);
  console.log(`Using ${await base.name()} at ${base.address} as base`);

  const strategies = readAddressMappingIfExists(STRATEGIES_FILE);
  const strategyFactory = await ethers.getContractFactory('Strategy', {
    libraries: {
      SafeERC20Namer: ctx.protocol.get('safeERC20Namer')!,
      YieldMathExtensions: ctx.protocol.get('yieldMathExtensions')!,
    },
  }) as Strategy__factory;

  let strategy: Strategy
  if (strategies.has(strategyData.symbol)) {
    strategy = await getContract<Strategy>(ctx.owner, "Strategy", strategies.get(strategyData.symbol)!);
  } else {
    strategy = (await strategyFactory.deploy(
      strategyData.name,
      strategyData.symbol,
      ctx.ladle.address,
      base.address,
      strategyData.baseId)) as Strategy;
    console.log(`[Strategy, '${strategy.address}'],`)
    verify(strategy.address, [strategyData.name,
    strategyData.symbol,
    ctx.ladle.address,
    base.address,
    strategyData.baseId], 'safeERC20Namer.js');

    strategies.set(strategyData.symbol, strategy.address);
    writeAddressMap(STRATEGIES_FILE, strategies);
  }
  if (!(await strategy.hasRole(ctx.ROOT, ctx.timelock.address))) {
    await strategy.grantRole(ctx.ROOT, ctx.timelock.address)
    console.log(`strategy.grantRoles(ROOT, timelock)`)
    while (!(await strategy.hasRole(ctx.ROOT, ctx.timelock.address))) { }
  }
  return strategy;
}

export async function proposeStrategyACL(ctx: DeployedContext, strategy: Strategy): Promise<Proposal> {
  const proposal: Proposal = [];

  const symbol = await strategy.symbol();

  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('grantRoles', [
      [
        ctx.ROOT,
        id(strategy.interface, 'setRewardsToken(address)'),
        id(strategy.interface, 'setRewards(uint32,uint32,uint96)'),
        id(strategy.interface, 'setYield(address)'),
        id(strategy.interface, 'setTokenId(bytes6)'),
        id(strategy.interface, 'resetTokenJoin()'),
        id(strategy.interface, 'setNextPool(address,bytes6)'),
        id(strategy.interface, 'startPool(uint256,uint256)'),
      ],
      ctx.timelock.address,
    ]),
  })
  console.log(`strategy(${symbol}).grantRoles(gov, timelock)`)
  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('revokeRole', [ctx.ROOT, ctx.owner.address]),
  })
  console.log(`strategy(${symbol}).revokeRole(ROOT, deployer)`)
  return proposal;
}

export async function proposeStrategyInit(ctx: DeployedContext, data: StrategyInitData): Promise<Proposal> {
  console.log(`Building init proposal for ${JSON.stringify(data)}`);
  const proposal: Proposal = [];
  const strategies = readAddressMappingIfExists(STRATEGIES_FILE);

  const strategy = await getContract<Strategy>(ctx.owner, "Strategy", strategies.get(data.symbol)!);

  const base = await getContract<ERC20Mock>(ctx.owner, 'ERC20Mock', await strategy.base());
  const baseUnit: BigNumber = BigNumber.from(10).pow(await base.decimals())

  const pool_address = (await ctx.getPoolForSeries(data.startPoolId)).address;
  if (pool_address == ZERO_ADDRESS) {
    throw new Error(`NULL pool for ${data}`);
  }

  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('setNextPool', [pool_address, data.startSeriesId]),
  })
  proposal.push({
    target: base.address,
    data: base.interface.encodeFunctionData('transfer', [strategy.address, BigNumber.from(100).mul(baseUnit)]),
  })
  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('startPool', [0, WAD]),
  })
  proposal.push({
    target: strategy.address,
    data: strategy.interface.encodeFunctionData('transfer', [ZERO_ADDRESS, BigNumber.from(100).mul(baseUnit)]), // Burn the strategy tokens minted
  })
  proposal.push({
    target: ctx.ladle.address,
    data: ctx.ladle.interface.encodeFunctionData('addIntegration', [strategy.address, true]),
  })
  proposal.push({
    target: ctx.ladle.address,
    data: ctx.ladle.interface.encodeFunctionData('addToken', [strategy.address, true]),
  });

  return proposal;
}