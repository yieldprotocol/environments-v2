import { ethers, waffle, artifacts, network } from 'hardhat'
import { fyTokenSources } from '../scripts/governance/add/addCollateral/addFYTokenCollateral/addFYTokenCollateral.arb_mainnet.config'
import { WAD } from '../shared/constants'
import { bytesToBytes32 } from '../shared/helpers'
import { YieldSpaceMultiOracle } from '../typechain'
const { deployContract } = waffle

const _24hours = 60 * 60 * 24
const _5minutes = 60 * 5

;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const poolOracleFactory = await ethers.getContractFactory('PoolOracle', ownerAcc)
  const poolOracle = await poolOracleFactory.deploy(_24hours, 24, _5minutes)
  const poolOracleAddress = poolOracle.address

  const ysMultiOracle = await deployContract(ownerAcc, await artifacts.readArtifact('YieldSpaceMultiOracle'), [poolOracleAddress]) as YieldSpaceMultiOracle

  for (const { seriesId, baseId, pool } of fyTokenSources) {
    await ysMultiOracle.setSource(seriesId, baseId, pool)
  }

  await network.provider.request({ method: 'evm_increaseTime', params: [60 * 5 + 10] })
  await network.provider.request({ method: 'evm_mine', params: [] })

  for (const { seriesId, baseId } of fyTokenSources) {
    await ysMultiOracle.peek(bytesToBytes32(seriesId), bytesToBytes32(baseId), WAD)
  }
  
})()
