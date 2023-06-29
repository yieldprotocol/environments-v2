import { getOwnerOrImpersonate, propose, id } from '../../../../shared/helpers'

import { grantPermission } from '../../../fragments/permissions/grantPermission'
import { Timelock__factory, TokenUpgrade__factory } from '../../../../typechain'
import { TIMELOCK, MULTISIG, TOKEN_UPGRADE } from '../../../../shared/constants'
import { Permission } from '../../confTypes'

const { developer, governance, protocol } = require(process.env.CONF as string)

/**
 * @dev This script gives unregister privileges to the multisig on TokenUpgrade.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const tokenUpgrade = TokenUpgrade__factory.connect(protocol.getOrThrow(TOKEN_UPGRADE)!, ownerAcc)

  const multisigUnregister: Permission = {
    functionName: id(tokenUpgrade.interface, 'unregister(address,address)'),
    host: tokenUpgrade.address,
    user: governance.getOrThrow(MULTISIG)!
  }

  let proposal = await grantPermission(multisigUnregister)

  await propose(timelock, proposal, developer)
})()
