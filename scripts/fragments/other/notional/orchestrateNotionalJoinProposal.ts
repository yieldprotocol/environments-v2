import { id } from '@yield-protocol/utils-v2'
import { getName } from '../../../../shared/helpers'
import { ROOT } from '../../../../shared/constants'

import { OldEmergencyBrake, Join__factory, NotionalJoin__factory } from '../../../../typechain'

export const orchestrateNotionalJoinProposal = async (
  ownerAcc: any,
  deployer: string,
  cloak: OldEmergencyBrake,
  joins: Map<string, string>
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the Join governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, Timelock already has ROOT as the deployer
  // Store a plan for isolating Join from Ladle and Witch
  let proposal: Array<{ target: string; data: string }> = []

  for (let [assetId, joinAddress] of joins) {
    const join = NotionalJoin__factory.connect(joinAddress, ownerAcc)
    const assetAddress = await join.asset() // Check it's a valid join

    const underlyingJoin = Join__factory.connect(await join.underlyingJoin(), ownerAcc)

    if (await join.hasRole(ROOT, deployer)) {
      proposal.push({
        target: join.address,
        data: join.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
      })
      console.log(`join.revokeRole(ROOT, deployer)`)
    }

    if (!(await join.hasRole(ROOT, cloak.address))) {
      proposal.push({
        target: join.address,
        data: join.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
      })
      console.log(`join.grantRole(ROOT, cloak)`)
    }

    if (
      !(
        (await underlyingJoin.hasRole(id(underlyingJoin.interface, 'join(address,uint128)'), join.address)) ||
        (await underlyingJoin.hasRole(id(underlyingJoin.interface, 'exit(address,uint128)'), join.address))
      )
    ) {
      proposal.push({
        target: underlyingJoin.address,
        data: underlyingJoin.interface.encodeFunctionData('grantRoles', [
          [
            id(underlyingJoin.interface, 'join(address,uint128)'),
            id(underlyingJoin.interface, 'exit(address,uint128)'),
          ],
          join.address,
        ]),
      })
      console.log(`underlyingJoin.grantRoles(join/exit, join)`)

      const plan = [
        {
          contact: underlyingJoin.address,
          signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
        },
      ]

      if ((await cloak.plans(await cloak.hash(join.address, plan))).state === 0) {
        proposal.push({
          target: cloak.address,
          data: cloak.interface.encodeFunctionData('plan', [join.address, plan]),
        })
        console.log(`cloak.plan(underlyingJoin, exit(${getName(assetId)})): ${await cloak.hash(join.address, plan)}`)
      }
    }
  }

  return proposal
}
