/**
 * @dev This script transfers all tokens from a join to another
 */
import { id } from '@yield-protocol/utils-v2'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Join__factory, Timelock, Ladle } from '../../../typechain'

export const drainJoinsFragment = async (
  ownerAcc: SignerWithAddress,
  timelock: Timelock,
  ladle: Ladle,
  joinReplacements: Array<[string, string]>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (const [oldJoinAddress, newJoinAddress] of joinReplacements) {
    const oldJoin = Join__factory.connect(oldJoinAddress, ownerAcc)
    const newJoin = Join__factory.connect(newJoinAddress, ownerAcc)

    // grant permissions
    proposal.push({
      target: oldJoin.address,
      data: oldJoin.interface.encodeFunctionData('grantRoles', [
        [id(oldJoin.interface, 'exit(address,uint128)')],
        timelock.address,
      ]),
    })
    console.log(`${'  '.repeat(nesting)}oldJoin.grantRoles(exit, join)`)

    proposal.push({
      target: newJoin.address,
      data: newJoin.interface.encodeFunctionData('grantRoles', [
        [id(newJoin.interface, 'join(address,uint128)')],
        timelock.address,
      ]),
    })
    console.log(`${'  '.repeat(nesting)}newJoin.grantRoles(join, join)`)

    const storedBalance = await oldJoin.storedBalance()

    // exit all to new join
    proposal.push({
      target: oldJoin.address,
      data: oldJoin.interface.encodeFunctionData('exit', [newJoin.address, storedBalance]),
    })
    console.log(`${'  '.repeat(nesting)}Transferring ${storedBalance} of ${oldJoin.asset()} to ${newJoin.address}`)

    // join all on new join
    proposal.push({
      target: newJoin.address,
      data: newJoin.interface.encodeFunctionData('join', [oldJoin.address, storedBalance]),
    })
    console.log(`${'  '.repeat(nesting)}Joining ${storedBalance} of ${oldJoin.asset()} at ${newJoin.address}`)

    // isolate from ladle
    proposal.push({
      target: oldJoin.address,
      data: oldJoin.interface.encodeFunctionData('revokeRoles', [
        [id(oldJoin.interface, 'join(address,uint128)'), id(oldJoin.interface, 'exit(address,uint128)')],
        ladle.address,
      ]),
    })
    console.log(`${'  '.repeat(nesting)}lodJoin.revokeRoles(join/exit, ladle)`)

    // revoke permissions
    proposal.push({
      target: oldJoin.address,
      data: oldJoin.interface.encodeFunctionData('revokeRoles', [
        [id(oldJoin.interface, 'exit(address,uint128)')],
        timelock.address,
      ]),
    })
    console.log(`${'  '.repeat(nesting)}oldJoin.revokeRoles(exit, join)`)

    proposal.push({
      target: newJoin.address,
      data: newJoin.interface.encodeFunctionData('revokeRoles', [
        [id(newJoin.interface, 'join(address,uint128)')],
        timelock.address,
      ]),
    })
    console.log(`${'  '.repeat(nesting)}newJoin.revokeRoles(join, join)`)
  }

  return proposal
}
