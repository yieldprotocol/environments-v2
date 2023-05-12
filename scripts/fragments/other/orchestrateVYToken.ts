import { ROOT } from '../../../shared/constants'
import { EmergencyBrake, Timelock, VYToken, Join__factory, Ladle, Router, VRRouter } from '../../../typechain'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev This script orchestrates the VYToken
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */
export const orchestrateVYToken = async (
  deployer: string,
  vyToken: VYToken,
  timelock: Timelock,
  router: VRRouter,
  cloak: EmergencyBrake,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_VYTOKEN`))
  let proposal: Array<{ target: string; data: string }> = []
  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer

  proposal.push({
    target: vyToken.address,
    data: vyToken.interface.encodeFunctionData('grantRoles', [
      [id(vyToken.interface, 'deposit(address,uint256)'), id(vyToken.interface, 'mint(address,uint256)')],
      router.address,
    ]),
  })
  console.log(indent(nesting, `vyToken.grantRoles([deposit, mint], router)`))

  const join = Join__factory.connect(await vyToken.join(), vyToken.signer)

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRoles', [
      [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      vyToken.address,
    ]),
  })
  console.log(indent(nesting, `join.grantRoles(gov, vyToken)`))

  proposal.push({
    target: vyToken.address,
    data: vyToken.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(indent(nesting, `vyToken.grantRole(ROOT, cloak)`))

  proposal = proposal.concat(await revokeRoot(vyToken, deployer, nesting + 1))

  return proposal
}
