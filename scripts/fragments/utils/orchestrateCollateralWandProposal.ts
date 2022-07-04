import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../shared/constants'

import { Timelock } from '../../../typechain'
import { CollateralWand } from '../../../typechain'
const { protocol } = require(process.env.CONF as string)
export const orchestrateCollateralWandProposal = async (
  ownerAcc: any,
  deployer: string,
  timelock: Timelock
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []
  const collateralWand = (await ethers.getContractAt(
    'CollateralWand',
    protocol.get('collateralWand') as string,
    ownerAcc
  )) as CollateralWand

  proposal.push({
    target: collateralWand.address,
    data: collateralWand.interface.encodeFunctionData('grantRole', [
      id(
        collateralWand.interface,
        'addChainlinkCollateral(bytes6,address,address,address,(bytes6,address,bytes6,address,address)[],(bytes6,uint32,uint64,uint96,uint24,uint8)[],(bytes6,bytes6,uint32,uint96,uint24,uint8)[],(bytes6,bytes6[])[])'
      ),
      timelock.address,
    ]),
  })
  proposal.push({
    target: collateralWand.address,
    data: collateralWand.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
  })

  return proposal
}
