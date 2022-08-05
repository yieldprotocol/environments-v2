import { ethers, waffle } from 'hardhat'
import { verify, writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'
import HealerModuleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/modules/HealerModule.sol/HealerModule.json'

import { Cauldron, HealerModule, IERC20 } from '../../../typechain'

const { deployContract } = waffle
const { developer, assets } = require(process.env.CONF as string)
const { protocol } = require(process.env.CONF as string)

const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

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
    transferModule = (await deployContract(ownerAcc, HealerModuleArtifact, [
      cauldron.address,
      wethAddress,
    ])) as HealerModule
    console.log(`HealerModule deployed at ${transferModule.address}`)
    verify(transferModule.address, [cauldron.address, wethAddress])
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

  const weth = (await ethers.getContractAt('IWETH9', wethAddress, ownerAcc)) as unknown as IERC20

  const healerModule = await deployHealerModule(ownerAcc, cauldron, weth, protocol)
  protocol.set('healerModule', healerModule.address)

  writeAddressMap('protocol.json', protocol)
})()
