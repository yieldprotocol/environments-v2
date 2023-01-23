import { id } from '@yield-protocol/utils-v2'
import { AccessControl, EmergencyBrake, Giver } from '../../../typechain'

export const addLeverToCloak = async (
  cloak: EmergencyBrake,
  levers: string[],
  giver: Giver
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  levers.forEach((element) => {
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('add', [
        element,
        [
          {
            host: giver.address,
            signature: id(giver.interface, 'seize(bytes12,address)'),
          },
        ],
      ]),
    })
  })

  console.log(`cloak.add(lever seize on Giver)`)

  return proposal
}
