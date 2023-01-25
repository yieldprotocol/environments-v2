import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const addExecutorsToCloak = async (
  cloak: EmergencyBrake,
  executors: Array<string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_EXECUTORS_TO_CLOAK`))
  const proposal: Array<{ target: string; data: string }> = []

  for (let executor of executors) {
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('grantRole', [id(cloak.interface, 'execute(address)'), executor]),
    })
    console.log(indent(nesting, `cloak.grantRole(executor ${executor})`))
  }

  return proposal
}
