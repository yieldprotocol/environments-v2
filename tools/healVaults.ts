import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { WAD, CAULDRON, LADLE, HEALER } from '../shared/constants'
import { Cauldron__factory, ERC20__factory, Join__factory, Ladle__factory, HealerModule__factory, IOracle__factory } from '../typechain';
const { whales, protocol, vaultIds } = require(process.env.CONF as string)

import { impersonate, bytesToBytes32 } from '../shared/helpers'

/**
 * @dev This script tops up uncollateralized vaults to one wei below the required collateralization, so that they get liquidated.
 */
;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.getOrThrow(LADLE)!, ownerAcc)
  const healer = HealerModule__factory.connect(protocol.getOrThrow(HEALER)!, ownerAcc)

  for (let vaultId of vaultIds) {
    const vault = await cauldron.vaults(vaultId)
    const ilkId = vault.ilkId
    const baseId = (await cauldron.series(vault.seriesId)).baseId
    const ilk = ERC20__factory.connect(await cauldron.assets(vault.ilkId), ownerAcc)
    const ilkJoin = Join__factory.connect(await ladle.joins(vault.ilkId), ownerAcc)
    const spotOracle = IOracle__factory.connect((await cauldron.spotOracles(baseId, ilkId)).oracle, ownerAcc)
    const level = BigNumber.from(await cauldron.callStatic.level(vaultId)) // Level is the absolute amount below the collateralized point

    const levelAsInk = BigNumber.from((await spotOracle.peek(bytesToBytes32(baseId), bytesToBytes32(ilkId), level.mul(-1).toString()))[0])
    const healAmount = levelAsInk.sub(1)
    console.log(`${vaultId} ${vault.ilkId} ${vault.seriesId} ${level} ${levelAsInk}`)

    // Remove once the amounts are known
    const whaleAcc = await impersonate(whales.getOrThrow(vault.ilkId)!, WAD)

    await ilk.connect(whaleAcc).approve(ladle.address, healAmount)
    await ladle.connect(whaleAcc).batch([
      ladle.interface.encodeFunctionData('transfer', [ilk.address, ilkJoin.address, healAmount]),
      ladle.interface.encodeFunctionData('moduleCall', [
        healer.address, healer.interface.encodeFunctionData('heal', [vaultId, healAmount, 0])
      ]),
    ], { gasLimit: 10000000 })
    console.log(`Healed ${healAmount} of ${vault.ilkId} to the vault ${vaultId}`)
  }
})()
