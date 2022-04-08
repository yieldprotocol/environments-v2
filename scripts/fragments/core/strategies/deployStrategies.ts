import { ethers } from 'hardhat'
import { verify } from '../../../../shared/helpers'
import { ROOT } from '../../../../shared/constants'
import { Cauldron, Ladle, Strategy, Timelock, SafeERC20Namer, YieldMathExtensions } from '../../../../typechain'

/**
 * @dev This script deploys strategies
 */

export const deployStrategies = async (
  ownerAcc: any,
  strategies: Map<string, string>,
  cauldron: Cauldron,
  ladle: Ladle,
  safeERC20Namer: SafeERC20Namer,
  yieldMathExtensions: YieldMathExtensions,
  timelock: Timelock,
  strategiesData: Array<[string, string, string]>
): Promise<Map<string, string>> => {
  const strategyFactory = await ethers.getContractFactory('Strategy', {
    libraries: {
      SafeERC20Namer: safeERC20Namer.address,
      YieldMathExtensions: yieldMathExtensions.address,
    },
  })

  let newStrategies: Map<string, string> = new Map()

  for (let [name, symbol, baseId] of strategiesData) {
    const base = await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      await cauldron.assets(baseId),
      ownerAcc
    )
    console.log(`Using ${await base.name()} at ${base.address} as base`)

    let strategy: Strategy
    if (strategies.get(symbol) === undefined) {
      strategy = await strategyFactory.deploy(name, symbol, ladle.address, base.address, baseId)
      console.log(`Strategy deployed at '${strategy.address}'`)
      verify(strategy.address, [name, symbol, ladle.address, base.address, baseId], 'safeERC20Namer.js')
      newStrategies.set(symbol, strategy.address)
    } else {
      console.log(`Reusing Strategy at ${strategies.get(symbol)}`)
      strategy = await ethers.getContractAt('Strategy', strategies.get(symbol) as string, ownerAcc)
    }
    if (!(await strategy.hasRole(ROOT, timelock.address))) {
      await strategy.grantRole(ROOT, timelock.address)
      console.log(`strategy.grantRoles(ROOT, timelock)`)
      while (!(await strategy.hasRole(ROOT, timelock.address))) {}
    }
  }

  return newStrategies
}
