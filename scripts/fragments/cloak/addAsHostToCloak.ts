import { AccessControl, EmergencyBrake } from '../../../typechain'
import { grantRoot } from '../permissions/grantRoot'

export const addAsHostToCloak = async (
  cloak: EmergencyBrake,
  host: AccessControl,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  // Register host in Cloak, which is done by giving it ROOT
  return await grantRoot(host, cloak.address)
}
