import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { impersonate, getOwnerOrImpersonate } from './helpers'
import { ERC20__factory, IOracle__factory, VRCauldron__factory, VRLadle__factory, VYToken__factory } from '../typechain'
import { VR_CAULDRON, VR_LADLE, WAD } from './constants'
const { developer, ilks, assets, whales, protocol, vyTokensToAdd, vyTokens } = require(process.env.CONF as string)

/**
 * @dev This script tests borrowing
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer, WAD)
  let whaleAcc: SignerWithAddress

  const cauldron = VRCauldron__factory.connect(protocol().getOrThrow(VR_CAULDRON)!, ownerAcc)
  const ladle = VRLadle__factory.connect(protocol().getOrThrow(VR_LADLE)!, ownerAcc)

  let oracle

  for (const vyToken of vyTokensToAdd) {
    const vyTokenContract = VYToken__factory.connect(vyTokens.get(vyToken)!, ownerAcc)
    const underlyingId = await vyTokenContract.underlyingId()
    const underlyingAddress = await vyTokenContract.underlying()
    const underlyingJoinAddress = await ladle.joins(underlyingId)
    const underlying = ERC20__factory.connect(underlyingAddress, ownerAcc)
    whaleAcc = await impersonate(whales.get(underlyingId) as string, WAD.mul(10))

    await underlying.connect(whaleAcc).approve(underlyingJoinAddress, WAD)
    await vyTokenContract.connect(whaleAcc).mint(whaleAcc.address, WAD)
  }
})()
