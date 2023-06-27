
import { MULTISIG, CLOAK } from '../shared/constants';
import { impersonate } from '../shared/helpers';
import { EmergencyBrake__factory } from '../typechain';

const { governance, restored } = require(process.env.CONF as string)


;(async () => {
  const multisig = await impersonate(governance.getOrThrow(MULTISIG)!)
  const cloak = EmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, multisig)
  for (let restoredAddress of restored) {
    console.log(`Restoring: ${restoredAddress}`);

    (await cloak.restore(restoredAddress)).wait(1);
    console.log(`Restored`);
  }
})()
