import { ethers } from 'hardhat'
import { getName } from '../shared/helpers'

const { joins } = require(process.env.CONF as string)


;(async () => {
  for (let [assetId, joinAddress] of joins) {
    const join = await ethers.getContractAt('Join', joinAddress)
  
    console.log(`${getName(assetId)} Join: ${(await join.storedBalance())}`)
  }
})()
