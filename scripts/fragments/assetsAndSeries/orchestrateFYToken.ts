import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake, Timelock, AccessControl__factory, FYToken } from '../../../typechain'
import { removeDeployer } from '../core/removeDeployer'
import { addAsHostToCloak } from '../cloak/addAsHostToCloak'
import { indent } from '../../../shared/helpers'

export const orchestrateFYToken = async (
  timelock: Timelock,
  cloak: EmergencyBrake,
  fyToken: FYToken,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_FYTOKEN`))
  let proposal: Array<{ target: string; data: string }> = []

  const fyTokenAsAccessControl = AccessControl__factory.connect(fyToken.address, fyToken.signer)
  proposal = proposal.concat(await removeDeployer(fyTokenAsAccessControl, nesting + 1))
  proposal = proposal.concat(await addAsHostToCloak(cloak, fyTokenAsAccessControl, nesting + 1))

  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('grantRoles', [
      [id(fyToken.interface, 'point(bytes32,address)'), id(fyToken.interface, 'setFlashFeeFactor(uint256)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `fyToken.grantRoles(gov, timelock)`))

  return proposal
}
