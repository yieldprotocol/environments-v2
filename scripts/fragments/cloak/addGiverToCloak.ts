import { id } from '@yield-protocol/utils-v2'
import { Cauldron, EmergencyBrake, Giver } from '../../../typechain'

export const addGiverToCloak = async (
  cloak: EmergencyBrake,
  giver: Giver,
  cauldron: Cauldron,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}ADD_GIVER_TO_CLOAK`)
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
  console.log(`${'  '.repeat(nesting)}cloak.add(giver give on cauldron)`)

  return proposal
}
