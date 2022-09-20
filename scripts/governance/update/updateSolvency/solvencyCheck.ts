import { ethers } from 'hardhat'

const { protocol } = require(process.env.CONF as string)

;(async () => {
  const solvency = await ethers.getContractAt('Solvency', protocol.get('solvency') as string)

  console.log(`Available ${await solvency.available()}`)
  console.log(`Redeemable ${await solvency.redeemable()}`)
  console.log(`Delta ${await solvency.delta()}`)
  console.log(`Ratio ${await solvency.ratio()}`)
})()
