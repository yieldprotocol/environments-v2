import { FYToken } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const setFlashFeeOnFytoken = async (
  fyToken: FYToken,
  flashFee: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `SET_FLASH_FEE_ON_FYTOKEN`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: fyToken.address,
    data: fyToken.interface.encodeFunctionData('setFlashFeeFactor', [flashFee]),
  })
  console.log(indent(nesting, `fyToken.setFlashFeeFactor(flashFee)`))

  return proposal
}
