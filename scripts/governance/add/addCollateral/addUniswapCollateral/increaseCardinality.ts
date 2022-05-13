import { ethers } from 'hardhat'

/**
 * @dev This script increases the observation cardinality of a Uniswap V3 Pool
 */
;(async () => {
  const [me] = await ethers.getSigners()
  const newCardinality = 60
  const ABI = [
    'function increaseObservationCardinalityNext(uint16)',
    'function slot0() view returns(uint160,int24,uint16,uint16,uint16,uint8,bool)',
  ]
  const poolAddress = '0x92560c178ce069cc014138ed3c2f5221ba71f58a'
  const pool = new ethers.Contract(poolAddress, ABI, ethers.provider)
  const cardinalityBefore = (await pool.slot0())[4]
  if (cardinalityBefore < newCardinality) {
    console.log(`Cardinality at ${poolAddress}: ${cardinalityBefore}`)
    await pool.connect(me).increaseObservationCardinalityNext(60)
    console.log(`Submitted request, waiting for confirmation...`)
    while ((await pool.slot0())[4] === cardinalityBefore) {}
  }
  console.log(`Cardinality at ${poolAddress}: ${(await pool.slot0())[4]}`)
})()
