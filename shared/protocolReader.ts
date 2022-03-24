import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import { protocolObject } from './protocolObject'
import { NetworksEntityProxy, ProtocolEntity, ProtocolObjectProxy, ProtocolProxy } from './proxyCode'
import { plainToClass,serialize } from 'class-transformer'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

// const { governance, protocol, pools, developer, deployer } = require(process.env.BASE as string)
;(async () => {
  // const protocol = new protocolObject();
  // let network = {} as ProtocolEntity;
  // console.log(network)
  // network.address ='blsj'
  // network.git='add'
  // console.log(network)

  let protocol = JSON.parse(
    await readFileSync(
      '/Users/praffulsahu/Documents/Crypto/Yield/environments-v2/protocolObject/protocolObject.json',
      'utf8'
    )
  )
  let protocolObjPrx = plainToClass(ProtocolObjectProxy, protocol)
  let protocolObj = new protocolObject(protocolObjPrx)
  // protocolObj.networks = protocolObjPrx
  for (const network of protocolObj.networks) {
    // TODO: reliable method of detecting network
    if (hre.network.name == network.name) {
      await protocolObj.loadProtocol(hre.network.name)
      break
    }
  }

  await protocolObj.loadData()

  // console.log(protocolObj)

  let photos = serialize(protocolObj.protOb);
  console.log(photos)
})()
