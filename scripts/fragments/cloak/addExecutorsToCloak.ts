import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake } from '../../../typechain'

export const addExecutorsToCloak = async (
  cloak: EmergencyBrake,
  executors: Array<string>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let executor of executors) {
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('grantRole', [id(cloak.interface, 'execute(address)'), executor]),
    })
    console.log(`cloak.grantRole(executor ${executor})`)
  }

  return proposal
}
