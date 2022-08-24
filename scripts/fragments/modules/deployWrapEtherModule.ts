import { ethers, waffle, network } from 'hardhat'
import { verify } from '../../../shared/helpers'
import WrapEtherModuleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/other/ether/WrapEtherModule.sol/WrapEtherModule.json'

import { Cauldron, ERC20, WrapEtherModule } from '../../../typechain'

const { deployContract } = waffle
const hre = require('hardhat')
/**
 * @dev This script deploys the WrapEtherModule
 */
export const deployWrapEtherModule = async (
  ownerAcc: any,
  cauldron: Cauldron,
  weth: ERC20,
  protocol: Map<string, string>
): Promise<WrapEtherModule> => {
  let transferModule: WrapEtherModule
  if (protocol.get('wrapEtherModule') === undefined) {
    transferModule = (await deployContract(ownerAcc, WrapEtherModuleArtifact, [
      cauldron.address,
      weth.address,
    ])) as WrapEtherModule
    console.log(`WrapEtherModule deployed at ${transferModule.address}`)
    verify(transferModule.address, [cauldron.address, weth.address])
    if (network.name == 'tenderly') {
      await hre.tenderly.persistArtifacts({
        name: 'WrapEtherModule',
        address: transferModule.address,
      })

      await hre.tenderly.verify({
        name: 'WrapEtherModule',
        address: transferModule.address,
      })
    }
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
