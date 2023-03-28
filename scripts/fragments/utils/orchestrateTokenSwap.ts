import { TokenSwap, Timelock } from '../../../typechain'
import { ROOT } from '../../../shared/constants'
import { revokeRoot } from '../permissions/revokeRoot'
import { indent, id } from '../../../shared/helpers'

/**
 * @dev This script orchestrates the tokenSwap
 * Revokes the ROOT role of deployer
 */
export const orchestrateTokenSwap = async (
  deployer: string,
  tokenSwap: TokenSwap,
  timelock: Timelock,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `ORCHESTRATE_TOKEN_SWAP`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: tokenSwap.address,
    data: tokenSwap.interface.encodeFunctionData('grantRoles', [
      [
        id(tokenSwap.interface, 'register(address,address)'),
        id(tokenSwap.interface, 'unregister(address,address)'),
        id(tokenSwap.interface, 'extract(address,address)'),
        id(tokenSwap.interface, 'recover(address,address)'),
      ],
      timelock.address,
    ]),
  })

  proposal = proposal.concat(await revokeRoot(tokenSwap, deployer, nesting + 1))
  return proposal
}
