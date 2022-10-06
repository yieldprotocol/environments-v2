import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { DAI, USDC } from '../../../../shared/constants'
import { getOwnerOrImpersonate } from '../../../../shared/helpers'
import { ERC20__factory } from '../../../../typechain'
import * as base_config from '../../base.arb_mainnet.config'

export const governance: Map<string, string> = base_config.governance
export const assets: Map<string, string> = base_config.assets

export const developer = '0x1662BbbDdA3fb169f10C495AE27596Af7f8fD3E1'
export const devFundsRecipient = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

const daiAddr = assets.get(DAI) as string
export const daiToSend = '46987.504556272699004437' // amount recovered from pool

const usdcAddr = assets.get(USDC) as string
export const usdcToSend = '159611.601407' // amount recovered from pool

// Gather the token send data to use in the proposal
export const sendData = async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  let data: Array<[string, string, BigNumber]> = [] // [token address, destination address, amount]

  for (const tokenAddr of [daiAddr, usdcAddr]) {
    const token = ERC20__factory.connect(tokenAddr, timelock.signer)
    const amount = ethers.utils.parseUnits(tokenAddr === daiAddr ? daiToSend : usdcToSend, await token.decimals())
    data.push([tokenAddr, devFundsRecipient, amount])
  }

  return data
}
