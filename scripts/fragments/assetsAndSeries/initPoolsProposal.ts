/**
 * @dev This script initializes pools in the protocol.
 *
 * It takes as inputs the governance and pools json address files.
 */

import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { ZERO_ADDRESS } from '../../../shared/constants'

import { ERC20Mock, Pool, FYToken, Join, Timelock } from '../../../typechain'

export const initPoolsProposal = async (
  ownerAcc: any,
  timelock: Timelock,
  newPools: Map<string, string>,
  poolsInit: Array<[string, string, BigNumber, BigNumber]>
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, baseId, baseAmount, fyTokenAmount] of poolsInit) {
    const poolAddress = newPools.get(seriesId) as string
    if ((await ethers.provider.getCode(poolAddress)) === '0x') throw `Pool at ${poolAddress} contains no code`
    else console.log(`Using pool at ${poolAddress} for ${seriesId}`)
    const pool: Pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool
    const fyToken: FYToken = (await ethers.getContractAt('FYToken', await pool.fyToken(), ownerAcc)) as FYToken
    const base: ERC20Mock = (await ethers.getContractAt(
      'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
      await pool.base(),
      ownerAcc
    )) as ERC20Mock
    const join: Join = (await ethers.getContractAt('Join', await fyToken.join(), ownerAcc)) as Join

    // Supply pool with a hundred tokens of underlying for initialization
    console.log(`Timelock balance of ${baseId} is ${await base.balanceOf(timelock.address)}`)

    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [poolAddress, baseAmount]),
    })
    console.log(`Transferring ${baseAmount} of ${baseId} from Timelock to Pool`)

    // Initialize pool
    proposal.push({
      target: pool.address,
      data: pool.interface.encodeFunctionData('mint', [ZERO_ADDRESS, ZERO_ADDRESS, 0, 0]), // Send the LP tokens to the zero address, maxRatio is set to zero, purposefully reverting this if someone has already initialized the pool
    })
    console.log(`Initializing ${await pool.symbol()} at ${poolAddress}`)

    // Skew pool
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [join.address, fyTokenAmount]),
    })
    console.log(`Transferring ${fyTokenAmount} of ${baseId} from Timelock to Join`)
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('mintWithUnderlying', [pool.address, fyTokenAmount]),
    })
    console.log(`Minting ${fyTokenAmount} amount with underlying to ${pool.address}`)
    // proposal.push({
    //   target: pool.address,
    //   data: pool.interface.encodeFunctionData('sellFYToken', [timelock.address, 0]),
    // })
  }

  return proposal
}
