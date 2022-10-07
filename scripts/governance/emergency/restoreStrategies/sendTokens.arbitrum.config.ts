import { BigNumber } from 'ethers'
import { DAI, USDC } from '../../../../shared/constants'
import * as base_config from '../../base.arb_mainnet.config'

export const governance: Map<string, string> = base_config.governance
export const assets: Map<string, string> = base_config.assets

export const developer = '0x1662BbbDdA3fb169f10C495AE27596Af7f8fD3E1'
export const devFundsRecipient = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

const daiAddr = assets.get(DAI) as string
export const daiToSend = '46987504556272699004437' // 46987.504556272699004437 amount recovered from pool in dai decimals

const usdcAddr = assets.get(USDC) as string
export const usdcToSend = '159611601407' // 159611.601407 amount recovered from pool in usdc decimals

// Gather the token send data to use in the proposal
export const sendData = async () => {
  let data: Array<[string, string, BigNumber]> = [] // [token address, destination address, amount]

  for (const tokenAddr of [daiAddr, usdcAddr]) {
    const amount = BigNumber.from(tokenAddr === daiAddr ? daiToSend : usdcToSend)
    data.push([tokenAddr, devFundsRecipient, amount])
  }

  return data
}
