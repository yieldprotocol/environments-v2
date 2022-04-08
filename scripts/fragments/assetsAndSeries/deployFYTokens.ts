import { ethers } from 'hardhat'
import { verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import { Timelock, FYToken, SafeERC20Namer } from '../../../typechain'

/**
 * @dev This script deploys a number of FYTokens
 */

export const deployFYTokens = async (
  ownerAcc: any,
  timelock: Timelock,
  safeERC20Namer: SafeERC20Namer,
  fyTokenData: Array<[string, string, string, string, number, string, string]>
): Promise<Map<string, FYToken>> => {
  const fyTokenFactory = await ethers.getContractFactory('FYToken', {
    libraries: {
      SafeERC20Namer: safeERC20Namer.address,
    },
  })

  let fyTokens: Map<string, FYToken> = new Map()
  for (let [seriesId, underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol] of fyTokenData) {
    if (joinAddress === undefined) throw `Join for ${seriesId} not found`

    if ((await ethers.provider.getCode(joinAddress)) === '0x') throw `Join at ${joinAddress} contains no code`
    else console.log(`Using join at ${joinAddress} for ${seriesId}`)

    if ((await ethers.provider.getCode(chiOracleAddress)) === '0x')
      throw `Oracle at ${chiOracleAddress} contains no code`
    else console.log(`Using oracle at ${chiOracleAddress} for ${seriesId}`)

    const args = [underlyingId, chiOracleAddress, joinAddress, maturity, name, symbol]
    const fyToken = (await fyTokenFactory.deploy(
      underlyingId,
      chiOracleAddress,
      joinAddress,
      maturity,
      name,
      symbol
    )) as unknown as FYToken
    await fyToken.deployed()
    console.log(`FYToken deployed at ${fyToken.address}`)
    verify(fyToken.address, args, 'safeERC20Namer.js')

    if (!(await fyToken.hasRole(ROOT, timelock.address))) {
      await fyToken.grantRole(ROOT, timelock.address)
      console.log(`fyToken.grantRoles(ROOT, timelock)`)
      while (!(await fyToken.hasRole(ROOT, timelock.address))) {}
    }

    fyTokens.set(seriesId, fyToken)
  }

  return fyTokens
}
