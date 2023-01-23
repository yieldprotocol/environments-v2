import { AccessControl, EmergencyBrake } from '../../../typechain'
import { grantRoot } from '../permissions/grantRoot'

export const addAsHostToCloak = async (
  cloak: EmergencyBrake,
  host: AccessControl,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}ADD_AS_HOST_TO_CLOAK`)
  // Register host in Cloak, which is done by giving it ROOT
  return await grantRoot(host, cloak.address)
}
