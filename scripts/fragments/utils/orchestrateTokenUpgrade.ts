import { TokenUpgrade, Timelock } from '../../../typechain'
import { ROOT } from '../../../shared/constants'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev This script orchestrates the tokenUpgrade
 * Revokes the ROOT role of deployer
 */
export const orchestrateTokenUpgrade = async (
  deployer: string,
  tokenUpgrade: TokenUpgrade,
  timelock: Timelock,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_TOKEN_UPGRADE`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: tokenUpgrade.address,
    data: tokenUpgrade.interface.encodeFunctionData('grantRoles', [
      [
        id(tokenUpgrade.interface, 'register(address,address,bytes32)'),
        id(tokenUpgrade.interface, 'unregister(address,address)'),
        id(tokenUpgrade.interface, 'extract(address,address)'),
        id(tokenUpgrade.interface, 'recover(address,address)'),
      ],
      timelock.address,
    ]),
  })

  proposal = proposal.concat(await revokeRoot(tokenUpgrade, deployer, nesting + 1))
  return proposal
}
