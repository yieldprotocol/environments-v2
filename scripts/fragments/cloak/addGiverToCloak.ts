import { id } from '@yield-protocol/utils-v2'
import { Cauldron, EmergencyBrake, Giver } from '../../../typechain'

export const addGiverToCloak = async (
  cloak: EmergencyBrake,
  giver: Giver,
  cauldron: Cauldron
): Promise<Array<{ target: string; data: string }>> => {
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
  console.log(`cloak.add(giver give on cauldron)`)

  return proposal
}
