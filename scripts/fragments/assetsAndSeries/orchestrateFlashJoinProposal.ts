import { id } from '@yield-protocol/utils-v2'
import { FlashJoin__factory } from '../../../typechain'
import { orchestrateJoinProposal } from './orchestrateJoinProposal'

export const orchestrateFlashJoinProposal = async (
  ownerAcc: any,
  deployer: string,
  ladle: any,
  timelock: any,
  cloak: any,
  assets: [string, string, string][]
): Promise<Array<{ target: string; data: string }>> => {
  // Give access to each of the FlashJoin governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, Timelock already has ROOT as the deployer
  // Store a plan for isolating FlashJoin from Ladle and Witch
  let proposal: Array<{ target: string; data: string }> = []

  for (let [, , joinAddress] of assets) {
    const join = FlashJoin__factory.connect(joinAddress, ownerAcc)
    await join.asset() // Check it's a valid join

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [id(join.interface, 'setFlashFeeFactor(uint256)')],
        timelock.address,
      ]),
    })
    console.log(`join.grantRoles(gov, timelock)`)
  }

  return proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, cloak, assets))
}
