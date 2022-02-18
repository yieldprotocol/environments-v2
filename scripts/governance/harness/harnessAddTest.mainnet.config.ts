import { CVX3CRV } from '../../../shared/constants'
export const { assets, developer } = require(process.env.BASE as string)

export const assetsToAdd: Array<[string, string]> = [[CVX3CRV, assets.get(CVX3CRV) as string]]
