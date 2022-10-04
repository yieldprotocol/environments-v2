import * as base_config from '../../../../base.mainnet.config'

import { readAddressMappingIfExists } from '../../../../../../shared/helpers'

export const developer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'
export const deployer: string = '0xC7aE076086623ecEA2450e364C838916a043F9a8'

export const governance: Map<string, string> = base_config.governance
export const protocol: Map<string, string> = base_config.protocol
export const joins = readAddressMappingIfExists('joins.json')

// Proposal
export { orchestrateFCashWandProposal } from '../../../../../../scripts/fragments/utils/orchestrateFCashWandProposal'

// Old Asset IDs - for reference
import { FDAI2209, FUSDC2209 } from '../../../../../../shared/constants'
const oldDaiId = FDAI2209
const oldUsdcId = FUSDC2209
export { oldDaiId, oldUsdcId }

// New Asset IDs - to be deployed
import { FDAI2212, FUSDC2212 } from '../../../../../../shared/constants'
const newDaiId = FDAI2212
const newUsdcId = FUSDC2212
export { newDaiId, newUsdcId }

// ERC1155 contract address of fCash tokens
export const notionalAssetAddress = '0x1344A36A1B56144C3Bc62E7757377D288fDE0369'

// Dec series
export const newDaiSeriesId = '0x303130380000'
export const newUSDCSeriesID = '0x303230380000'
