import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ROOT } from '../../../shared/constants'
import { EmergencyBrake, AccessControl__factory } from '../../../typechain'

export const giveRootToCloakFragment = async (
  signerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  hosts: Array<string>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let hostAddress of hosts) {
    const host = AccessControl__factory.connect(hostAddress, signerAcc)
    proposal.push({
      target: host.address,
      data: host.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
    })
    console.log(`${host.address} grantRole(ROOT cloak)`)
  }

  return proposal
}
