import { protocolObject } from './protocolObject'
;(async () => {
  let protocolObj = await protocolObject.LOAD()
  // Load data into the object based on the set network
  await protocolObj.loadData()
  // Save data into the object based on the set network
  await protocolObj.saveObject()
})()
