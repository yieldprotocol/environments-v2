/**
 * @dev This script mints fyToken without backing it with collateral.
 */
import { BigNumber } from 'ethers'
import { indent, id } from '../../../shared/helpers'
import { Timelock, FYToken } from '../../../typechain'

export const mintFYToken = async (
  timelock: Timelock,
  fyToken: FYToken,
  receiver: string,
  amount: BigNumber,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MINT__FYTOKEN`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  // Allow the timelock to mint fyToken
  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('grantRoles', [
      [id(fyToken.interface, 'mint(address,uint256)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `fyToken.grantRoles(mint, timelock)`))

  // Mint fyToken
  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('mint', [receiver, amount]),
  })
  console.log(indent(nesting, `Minted ${amount} of ${await fyToken.name()} to ${receiver}`));

  // Revoke the timelock's minting rights
  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('revokeRoles', [
      [id(fyToken.interface, 'mint(address,uint256)')],
      timelock.address,
    ]),
  })
  console.log(indent(nesting, `fyToken.revokeRoles(mint, timelock)`))

  return proposal
}
