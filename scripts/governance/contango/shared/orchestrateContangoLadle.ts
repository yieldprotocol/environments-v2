import { ContangoLadle, OldEmergencyBrake } from '../../../../typechain'
import { id } from '../../../../shared/helpers'

export const orchestrateContangoLadle = async (
  contangoAddress: string,
  contangoLadle: ContangoLadle,
  cloak: OldEmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: contangoLadle.address,
    data: contangoLadle.interface.encodeFunctionData('grantRole', [
      id(contangoLadle.interface, 'deterministicBuild(bytes12,bytes6,bytes6)'),
      contangoAddress,
    ]),
  })
  console.log(`contangoLadle.grantRole(contango)`)

  const plan = [
    {
      contact: contangoLadle.address,
      signatures: [id(contangoLadle.interface, 'deterministicBuild(bytes12,bytes6,bytes6)')],
    },
  ]

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('plan', [contangoLadle.address, plan]),
  })
  console.log(`cloak.plan(contangoLadle): ${await cloak.hash(contangoLadle.address, plan)}`)

  return proposal
}
