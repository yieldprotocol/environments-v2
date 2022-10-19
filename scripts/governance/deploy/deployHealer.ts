import { ethers, waffle } from 'hardhat'
import { ETH } from '../../../shared/constants'
import { verify, writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'
import HealerModuleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/modules/HealerModule.sol/HealerModule.json'

import { Cauldron, HealerModule, IERC20 } from '../../../typechain'

const { deployContract } = waffle
import { assets, developer, protocol } from '../base.mainnet.config'

/**
 * @dev This script deploys the HealerModule
 */
const deployHealerModule = async (
  ownerAcc: any,
  cauldron: Cauldron,
  weth: IERC20,
  protocol: Map<string, string>
): Promise<HealerModule> => {
  let transferModule: HealerModule
  if (protocol.get('transferModule') === undefined) {
    transferModule = (await deployContract(ownerAcc, HealerModuleArtifact, [cauldron.address, weth])) as HealerModule
    console.log(`HealerModule deployed at ${transferModule.address}`)
    verify('transferModule', transferModule, [cauldron.address, weth])
  } else {
    transferModule = (await ethers.getContractAt(
      'HealerModule',
      protocol.get('transferModule') as string,
      ownerAcc
    )) as unknown as HealerModule
    console.log(`Reusing HealerModule at ${transferModule.address}`)
  }

  return transferModule
}

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  const weth = assets.get(ETH) as unknown as IERC20

  const healerModule = await deployHealerModule(ownerAcc, cauldron, weth, protocol)
  protocol.set('healerModule', healerModule.address)

  writeAddressMap('protocol.json', protocol)
})()
