import { Ladle, VRRouter } from '../../../typechain'
import { indent } from '../../../shared/helpers'

/**
 * @dev This script orchestrates the VRRouter
 */
export const orchestrateVRRouter = async (
  router: VRRouter,
  ladle: Ladle,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_VRROUTER`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: router.address,
    data: router.interface.encodeFunctionData('initialize', [ladle.address]),
  })
  console.log(indent(nesting, `vrRouter.initialize(ladle)`))

  return proposal
}
