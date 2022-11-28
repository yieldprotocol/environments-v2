import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake, FYToken__factory, Join__factory } from '../../../typechain'

export const addExecutorsToCloakFragment = async (
  cloak: EmergencyBrake,
  executors: Array<string>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let executor of executors) {
    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('grantRole', [id(cloak.interface, 'execute(address)'), executor]),
    })
    console.log(`cloak.grantRole(executor ${executor})`)
  }

  return proposal
}
