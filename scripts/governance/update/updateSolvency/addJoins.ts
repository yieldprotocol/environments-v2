import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, bytesToBytes32 } from '../../../../shared/helpers'
import { ETH } from '../../../../shared/constants'

const { developer, protocol, newJoins, newSeries } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const solvency = await ethers.getContractAt('Solvency', protocol.get('solvency') as string, ownerAcc)

  for (let assetId of newJoins) {
    console.log(assetId)
    await (await solvency.addAssetId(assetId)).wait()
    try {
      const oracle = await ethers.getContractAt('IOracle', (await cauldron.spotOracles(assetId, ETH)).oracle as string)
      console.log(`Oracle: ${oracle.address}`)
      const join = await ethers.getContractAt('IJoin', (await ladle.joins(assetId)) as string)
      console.log(`Join: ${join.address}`)
      const storedBalance = await join.storedBalance()
      console.log(`Stored balance: ${storedBalance}`)
      console.log(
        `Available (this one): ${await oracle.peek(bytesToBytes32(assetId), bytesToBytes32(ETH), storedBalance)}`
      )

      console.log(`Available ${await solvency.available()}`)
      console.log(`Redeemable ${await solvency.redeemable()}`)
      console.log(`Delta ${await solvency.delta()}`)
      // console.log(`Ratio ${await solvency.ratio()}`)
    } catch (error) {
      console.log(`boo`)
    }
    // await(await solvency.removeAssetId()).wait()
    console.log()
  }

  for (let seriesId of newSeries) {
    console.log(seriesId)
    await (await solvency.addSeriesId(seriesId)).wait()
    try {
      const fyToken = await ethers.getContractAt('IFYToken', (await cauldron.series(seriesId)).fyToken as string)
      console.log(`FYToken: ${fyToken.address}`)
      const underlyingId = await fyToken.underlyingId()
      const oracle = await ethers.getContractAt(
        'IOracle',
        (
          await cauldron.spotOracles(underlyingId, ETH)
        ).oracle as string
      )
      console.log(`Oracle: ${oracle.address}`)
      const totalSupply = await fyToken.totalSupply()
      console.log(`Total Supply: ${totalSupply}`)
      console.log(
        `Redeemable (this one): ${await oracle.peek(bytesToBytes32(underlyingId), bytesToBytes32(ETH), totalSupply)}`
      )

      console.log(`Available ${await solvency.available()}`)
      console.log(`Redeemable ${await solvency.redeemable()}`)
      console.log(`Delta ${await solvency.delta()}`)
      // console.log(`Ratio ${await solvency.ratio()}`)
    } catch (error) {
      console.log(`boo`)
    }
    // await(await solvency.removeSeriesId()).wait()
    console.log()
  }
})()
