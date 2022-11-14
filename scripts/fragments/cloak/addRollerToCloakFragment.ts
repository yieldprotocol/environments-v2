import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { EmergencyBrake, Roller, Strategy__factory } from '../../../typechain'

export const addRollerToCloakFragment = async (
  signerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  roller: Roller,
  strategies: Map<string, string>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (let [strategyId, strategyAddress] of strategies) {
    const strategy = Strategy__factory.connect(strategyAddress, signerAcc)
    if (await strategy.hasRole(id(strategy.interface, 'startPool(uint256,uint256)'), roller.address)) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('add', [
          roller.address,
          [
            {
              host: strategy.address,
              signature: id(strategy.interface, 'startPool(uint256,uint256)'),
            },
          ],
        ]),
      })
      console.log(`cloak.add(roller startPool ${strategyId})`)
    }
  }

  return proposal
}
