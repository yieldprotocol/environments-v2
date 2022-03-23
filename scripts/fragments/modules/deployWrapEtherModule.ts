import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import WrapEtherModuleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/other/ether/WrapEtherModule.sol/WrapEtherModule.json'

import { Cauldron, WETH9Mock, WrapEtherModule } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the WrapEtherModule
 */
export const deployWrapEtherModule = async (
  ownerAcc: any,
  cauldron: Cauldron,
  weth: WETH9Mock,
  protocol: Map<string, string>
): Promise<WrapEtherModule> => {
  let transferModule: WrapEtherModule
  if (protocol.get('transferModule') === undefined) {
    transferModule = (await deployContract(ownerAcc, WrapEtherModuleArtifact, [
      cauldron.address,
      weth.address,
    ])) as WrapEtherModule
    console.log(`WrapEtherModule deployed at ${transferModule.address}`)
    verify(transferModule.address, [cauldron.address, weth.address])
  } else {
    transferModule = (await ethers.getContractAt(
      'WrapEtherModule',
      protocol.get('transferModule') as string,
      ownerAcc
    )) as unknown as WrapEtherModule
    console.log(`Reusing WrapEtherModule at ${transferModule.address}`)
  }

  return transferModule
}
