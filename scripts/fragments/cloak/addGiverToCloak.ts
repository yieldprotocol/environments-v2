import { Cauldron, EmergencyBrake, Giver } from '../../../typechain'
import { indent, id } from '../../../shared/helpers'

export const addGiverToCloak = async (
  cloak: EmergencyBrake,
  giver: Giver,
  cauldron: Cauldron,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ADD_GIVER_TO_CLOAK`))
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('add', [
      giver.address,
      [
        {
          host: cauldron.address,
          signature: id(cauldron.interface, 'give(bytes12,address)'),
        },
      ],
    ]),
  })
  console.log(indent(nesting, `cloak.add(giver give on cauldron)`))

  return proposal
}
