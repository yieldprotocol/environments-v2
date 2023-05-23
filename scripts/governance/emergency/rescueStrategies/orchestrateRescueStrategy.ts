import { id, indent } from '../../../../shared/helpers'
import { StrategyRescue, Timelock } from '../../../../typechain'

export const orchestrateRescueStrategy = async (
  strategyRescue: StrategyRescue,
  timelock: Timelock,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `GRANT_PERMISSION`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: strategyRescue.address,
    data: strategyRescue.interface.encodeFunctionData('grantRole', [
      id(strategyRescue.interface, 'startRescue(bytes6,address)'),
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `strategyRescue.grantRole(startRescue, ${timelock.address})`))

  return proposal
}
