import { EmergencyBrake, Giver } from '../../../typechain'
import { indent, id } from '../../../shared/helpers'

export const addLeverToCloak = async (
  cloak: EmergencyBrake,
  levers: string[],
  giver: Giver,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_LEVER_TO_CLOAK`))
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

  console.log(indent(nesting, `cloak.add(lever seize on Giver)`))

  return proposal
}
