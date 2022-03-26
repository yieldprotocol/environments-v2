import { protocolObject } from './protocolObject'
;(async () => {
  let protocolObj = await protocolObject.CREATE()
  // Show what is different on chain vs in protocolObj
  await protocolObj.diffData()
})()
