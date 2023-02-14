import { Ladle, FlashJoin } from '../../../typechain'
import { indent } from '../../../shared/helpers'

export const setFlashFeeOnJoin = async (
  ladle: Ladle,
  join: FlashJoin,
  flashFee: string,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `SET_FLASH_FEE_ON_JOIN`))
  let proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('setFlashFeeFactor', [flashFee]),
  })
  console.log(indent(nesting, `join.setFlashFeeFactor(flashFee)`))

  return proposal
}
