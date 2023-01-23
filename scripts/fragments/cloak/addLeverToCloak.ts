import { id } from '@yield-protocol/utils-v2'
import { AccessControl, EmergencyBrake, Giver } from '../../../typechain'

export const addLeverToCloak = async (
  cloak: EmergencyBrake,
  levers: string[],
  giver: Giver,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}ADD_LEVER_TO_CLOAK`)
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

  console.log(`${'  '.repeat(nesting)}cloak.add(lever seize on Giver)`)

  return proposal
}
