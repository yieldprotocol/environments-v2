import { ethers } from 'hardhat'
import { getOwnerOrImpersonate } from '../../../../shared/helpers'

const { developer, protocol, newJoins } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const solvency = await ethers.getContractAt('Solvency', protocol.get('solvency') as string, ownerAcc)

  for (let assetId of newJoins) {
    console.log(assetId)
    await solvency.addAssetId(assetId)
    console.log(`Available ${await solvency.available()}`)
    console.log(`Redeemable ${await solvency.redeemable()}`)
    console.log(`Delta ${await solvency.delta()}`)
    //    console.log(`Ratio ${await solvency.ratio()}`)
  }
})()
