/**
 * @dev This script mints fyToken without backing it with collateral.
 */
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { getName, indent, id } from '../../../shared/helpers'
import { Timelock, Cauldron } from '../../../typechain'
import { FYToken__factory } from '../../../typechain/factories/@yield-protocol/vault-v2/contracts'

export const mintFYToken = async (
  timelock: Timelock,
  cauldron: Cauldron,
  seriesId: string,
  receiver: string,
  amount: BigNumber,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MINT__FYTOKEN`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  const fyToken = FYToken__factory.connect((await cauldron.series(seriesId)).fyToken, ethers.provider)

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
  console.log(indent(nesting, `Minted ${amount} of ${getName(seriesId)} to ${receiver}`));

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
