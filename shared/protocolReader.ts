import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import { protocolObject } from './protocolObject'
import { NetworksEntityProxy, ProtocolEntity, ProtocolObjectProxy, ProtocolProxy } from './proxyCode'
import { plainToClass, serialize } from 'class-transformer'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'


;(async () => {

  let protocol = JSON.parse(
    await readFileSync(
      './protocolObject/protocolObject2.json',
      'utf8'
    )
  )
  let protocolObjPrx = plainToClass(ProtocolObjectProxy, protocol)
  let protocolObj = new protocolObject(protocolObjPrx)
  
  for (const network of protocolObj.networks) {
    // TODO: reliable method of detecting network
    if (hre.network.name == network.name) {
      await protocolObj.loadProtocol(hre.network.name)
      break
    }
  }

  // Load data into the object based on the set network
  await protocolObj.loadData()
  let photos = serialize(protocolObj.protOb)
  
  writeFileSync('./protocolObject/protocolObject2.json', photos, 'utf8')
})()
