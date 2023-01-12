import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { stringToBytes32, bytesToBytes32, impersonate, getOwnerOrImpersonate } from '../shared/helpers'
import {
  FYToken,
  ERC20__factory,
  Ladle__factory,
  Cauldron__factory,
  CompositeMultiOracle__factory,
  IOracle__factory,
} from '../typechain'
import { CAULDRON, LADLE, WAD } from '../shared/constants'
const { developer, series, assets, whales, protocol } = require(process.env.CONF as string)

/**
 * @dev This script tests borrowing against crab strategy token
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer, WAD)
  let whaleAcc: SignerWithAddress

  const cauldron = Cauldron__factory.connect(protocol().getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE)!, ownerAcc)

  let oracle
  for (let seri of series) {
    for (const ilk of seri.ilks) {
      const collateral = ERC20__factory.connect(assets.get(ilk.ilkId)!, ownerAcc)

      oracle = IOracle__factory.connect(ilk.collateralization.oracle, ownerAcc)

      whaleAcc = await impersonate(whales.get(ilk.ilkId) as string, WAD.mul(10))
      console.log(`series: ${seri.seriesId}`)
      console.log(`ilk.ilkId: ${ilk.ilkId}`)
      const series = await cauldron.series(seri.seriesId)
      const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, ownerAcc)) as unknown as FYToken
      const dust = (await cauldron.debt(series.baseId, ilk.ilkId)).min

      const ratio = (await cauldron.spotOracles(series.baseId, ilk.ilkId)).ratio
      var borrowed = BigNumber.from(10)
        .pow(await fyToken.decimals())
        .mul(dust)
      const posted = (await oracle.peek(bytesToBytes32(ilk.baseId), bytesToBytes32(ilk.ilkId), borrowed))[0]
        .mul(ratio)
        .div(1000000)
        .mul(101)
        .div(100)
      const collateralBalanceBefore = await collateral.balanceOf(whaleAcc.address)
      // Build vault
      await ladle.connect(whaleAcc).build(seri.seriesId, ilk.ilkId, 0)
      const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
      const vaultId = logs[logs.length - 1].args.vaultId
      console.log(`vault: ${vaultId}`)

      var name = await fyToken.callStatic.name()
      // Post collateral and borrow
      const collateralJoinAddress = await ladle.joins(ilk.ilkId)
      console.log(`posting ${posted} ilk.ilkId out of ${await collateral.balanceOf(whaleAcc.address)}`)
      await collateral.connect(whaleAcc).transfer(collateralJoinAddress, posted)
      console.log(`borrowing ${borrowed} ${name}`)
      await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted, borrowed)
      console.log(`posted and borrowed`)

      if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
      if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

      await fyToken.connect(whaleAcc).transfer(fyToken.address, borrowed)
      console.log(`repaying ${borrowed} ${name} and withdrawing ${posted} ilk.ilkId`)
      await ladle.connect(whaleAcc).pour(vaultId, whaleAcc.address, posted.mul(-1), borrowed.mul(-1))
      console.log(`repaid and withdrawn`)
      if ((await collateral.balanceOf(whaleAcc.address)).toString() !== collateralBalanceBefore.toString())
        throw 'balance mismatch'
    }
  }
})()
