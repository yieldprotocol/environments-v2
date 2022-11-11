import { id } from '@yield-protocol/utils-v2'
import { bytesToString } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import { Ladle, Join__factory, EmergencyBrake } from '../../../typechain'

export const orchestrateJoinProposal = async (
  ownerAcc: any,
  deployer: string,
  ladle: Ladle,
  cloak: EmergencyBrake,
  assets: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the Join governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, Timelock already has ROOT as the deployer
  // Store a plan for isolating Join from Ladle and Witch
  let proposal: Array<{ target: string; data: string }> = []

  for (let [assetId, , joinAddress] of assets) {
    const join = Join__factory.connect(joinAddress, ownerAcc)
    await join.asset() // Check it's a valid join

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

    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      },
    ]

    if ((await cloak.plans(await cloak.hash(ladle.address, plan))).state === 0) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [ladle.address, plan]),
      })
      console.log(`cloak.plan(ladle, join(${bytesToString(assetId)})): ${await cloak.hash(ladle.address, plan)}`)
    }
  }

  return proposal
}
