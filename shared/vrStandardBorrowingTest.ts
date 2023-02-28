import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { impersonate, getOwnerOrImpersonate } from './helpers'
import { ERC20__factory, IOracle__factory, VRCauldron__factory, VRLadle__factory } from '../typechain'
import { VR_CAULDRON, VR_LADLE, WAD } from './constants'
const { developer, ilks, assets, whales, protocol } = require(process.env.CONF as string)

/**
 * @dev This script tests borrowing
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer, WAD)
  let whaleAcc: SignerWithAddress

  const cauldron = VRCauldron__factory.connect(protocol().getOrThrow(VR_CAULDRON)!, ownerAcc)
  const ladle = VRLadle__factory.connect(protocol().getOrThrow(VR_LADLE)!, ownerAcc)

  let oracle

  for (const ilk of ilks) {
    const collateral = ERC20__factory.connect(assets.get(ilk.ilkId)!, ownerAcc)

    oracle = IOracle__factory.connect(ilk.collateralization.oracle, ownerAcc)

    whaleAcc = await impersonate(whales.get(ilk.ilkId) as string, WAD.mul(10))
    console.log(`ilk.ilkId: ${ilk.ilkId}`)
    console.log(`ilk.baseId: ${ilk.baseId}`)
    const dust = (await cauldron.debt(ilk.baseId, ilk.ilkId)).min
    const base = ERC20__factory.connect(assets.get(ilk.baseId)!, ownerAcc)
    const ratio = (await cauldron.spotOracles(ilk.baseId, ilk.ilkId)).ratio

    var borrowed = BigNumber.from(10)
      .pow(await base.decimals())
      .mul(dust)
    const posted = (
      await oracle.peek(
        ilk.baseId + '0000000000000000000000000000000000000000000000000000',
        ilk.ilkId + '0000000000000000000000000000000000000000000000000000',
        borrowed
      )
    )[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100)

    const collateralBalanceBefore = await collateral.balanceOf(whaleAcc.address)

    // Build vault
    let data = await (await ladle.connect(whaleAcc).build(ilk.baseId, ilk.ilkId, 0)).wait()

    const vaultId = data.logs[0].topics[1].slice(0, 26)
    console.log(`vault: ${vaultId}`)

    var name = await collateral.callStatic.name()
    var baseName = await base.callStatic.name()
    // Post collateral and borrow
    const collateralJoinAddress = await ladle.joins(ilk.ilkId)
    const baseJoinAddress = await ladle.joins(ilk.baseId)
    console.log(`posting ${posted} ${name} out of ${await collateral.balanceOf(whaleAcc.address)}`)
    await collateral.connect(whaleAcc).approve(collateralJoinAddress, posted)
    console.log(`borrowing ${borrowed} ${baseName}`)
    await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    await base.connect(whaleAcc).approve(baseJoinAddress, borrowed)
    console.log(`repaying ${borrowed} ${baseName} and withdrawing ${posted} ${name}`)
    await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await collateral.balanceOf(whaleAcc.address)).toString() !== collateralBalanceBefore.toString())
      throw 'balance mismatch'
  }
})()
