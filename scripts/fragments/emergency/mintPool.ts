/**
 * @dev This script mints pool tokens from a pool that already has funds.
 */
import { indent } from '../../../shared/helpers'
import { Pool } from '../../../typechain'
import { MAX256 } from '../../../shared/constants'

export const mintPool = async (
  pool: Pool,
  receiver: string,
  remainder: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MINT__POOL`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  // Mint pool tokens
  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('mint', [receiver, remainder, '0', MAX256]),
  })
  console.log(indent(nesting, `Minted ${await pool.name()} to ${receiver}`));

  return proposal
}
