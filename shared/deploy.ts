import { getOwnerOrImpersonate, readAddressMappingIfExists } from './helpers'
import { Contract } from 'ethers'
import { TIMELOCK } from './constants'
import { ContractDeployment } from '../scripts/governance/confTypes'

import { deploy } from '../scripts/fragments/deploy'
const { governance, contractDeployment } = require(process.env.CONF as string)
const { deployer } = require(process.env.CONF as string)

import { Timelock__factory } from '../typechain'

/**
 * @dev This script deploys the Witch
 */
import { ethers } from 'hardhat'
;(async () => {
  // I would prefer to take this object from process.env.CONF, but then it doesn't work
  const contractToDeploy: ContractDeployment = contractDeployment // Only way I know to cast this
  let deployerAcc = await getOwnerOrImpersonate(deployer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, deployerAcc)

  const deployedAddress = readAddressMappingIfExists(contractToDeploy.addressFile).get(contractToDeploy.name)
  let deployedContract: Contract
  if (deployedAddress === undefined) {
    deployedContract = await deploy(
      timelock,
      contractToDeploy.addressFile,
      contractToDeploy.name,
      await ethers.getContractFactory(contractToDeploy.contract, deployerAcc),
      ...contractToDeploy.args
    )
  } else {
    console.log(`Reusing ${contractToDeploy.name} at: ${deployedAddress}`)
  }
})()
