import { indent } from '../../../../shared/helpers'
import { StrategyRescue, Strategy__factory, Timelock } from '../../../../typechain'

export const rescueStrategiesProposal = async (
  strategyRescue: StrategyRescue,
  strategiesToRecover: Array<{ underlyingId: string; strategy: string }>,
  timelock: Timelock,
  ownerAcc: any,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `RESCUE_STRATEGIES`))
  const proposal: Array<{ target: string; data: string }> = []

  for (let index = 0; index < strategiesToRecover.length; index++) {
    const element = strategiesToRecover[index]
    proposal.push({
      target: strategyRescue.address,
      data: strategyRescue.interface.encodeFunctionData('startRescue', [element['underlyingId'], element['strategy']]),
    })
    console.log(indent(nesting, `strategyRescue.startRescue(${element['underlyingId']} ${element['strategy']})`))
  }
  return proposal
}
