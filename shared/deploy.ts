import { getOwnerOrImpersonate, readAddressMappingIfExists } from './helpers'
import { Contract } from 'ethers'
import { TIMELOCK } from './constants'
import { ContractDeployment } from '../scripts/governance/confTypes'

import { deploy } from '../scripts/fragments/deploy'
const { governance, addressFile, name, contract, args } = require(process.env.CONF as string)
const { deployer } = require(process.env.CONF as string)

import { Timelock__factory } from '../typechain'

/**
 * @dev This script deploys the Witch
 */
import { ethers } from 'hardhat'
;(async () => {
  // I would prefer to take this object from process.env.CONF, but then it doesn't work
  const contractToDeploy: ContractDeployment = {
    addressFile: addressFile,
    name: name,
    contract: contract,
    args: args,
  }
  let deployerAcc = await getOwnerOrImpersonate(deployer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, deployerAcc)

  const deployedAddress = readAddressMappingIfExists(contractToDeploy.addressFile).get(contractToDeploy.name)
  let deployedContract: Contract
  if (deployedAddress === undefined) {
    // notice how after passing the 4th argument, TS will infer the correct params
    // To see what I mean, try deleting lines 29-31 and type them from scratch.
    switch (contractToDeploy.args.length) {
      case 0: {
        deployedContract = await deploy(
          timelock,
          contractToDeploy.addressFile,
          contractToDeploy.name,
          await ethers.getContractFactory(contractToDeploy.contract, deployerAcc)
        )
      }
      case 1: {
        deployedContract = await deploy(
          timelock,
          contractToDeploy.addressFile,
          contractToDeploy.name,
          await ethers.getContractFactory(contractToDeploy.contract, deployerAcc),
          contractToDeploy.args[0]
        )
      }
      case 2: {
        deployedContract = await deploy(
          timelock,
          contractToDeploy.addressFile,
          contractToDeploy.name,
          await ethers.getContractFactory(contractToDeploy.contract, deployerAcc),
          contractToDeploy.args[0],
          contractToDeploy.args[1]
        )
      }
      // ...
    }
  } else {
    console.log(`Reusing ${contractToDeploy.name} at: ${deployedAddress}`)
  }
})()
