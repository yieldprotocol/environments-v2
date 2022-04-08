import { ethers, waffle } from 'hardhat'
import { verify } from '../../../shared/helpers'
import Transfer1155ModuleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/other/notional/Transfer1155Module.sol/Transfer1155Module.json'

import { Cauldron, WETH9Mock, Transfer1155Module } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the Transfer1155Module
 */
export const deployTransfer1155Module = async (
  ownerAcc: any,
  cauldron: Cauldron,
  weth: WETH9Mock,
  protocol: Map<string, string>
): Promise<Transfer1155Module> => {
  let transferModule: Transfer1155Module
  if (protocol.get('transferModule') === undefined) {
    transferModule = (await deployContract(ownerAcc, Transfer1155ModuleArtifact, [
      cauldron.address,
      weth.address,
    ])) as Transfer1155Module
    console.log(`Transfer1155Module deployed at ${transferModule.address}`)
    verify(transferModule.address, [cauldron.address, weth.address])
  } else {
    transferModule = await ethers.getContractAt(
      'Transfer1155Module',
      protocol.get('transferModule') as string,
      ownerAcc
    )
    console.log(`Reusing Transfer1155Module at ${transferModule.address}`)
  }

  return transferModule
}
