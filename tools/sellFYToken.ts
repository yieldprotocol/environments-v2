
import { ZERO_ADDRESS } from '../shared/constants';
import { getOwnerOrImpersonate } from '../shared/helpers';
import { Pool__factory, ERC20__factory, FYToken__factory, Join__factory } from '../typechain';

const { trades, developer } = require(process.env.CONF as string)


;(async () => {
  const owner = await getOwnerOrImpersonate(developer)
  for (let [poolAddress, tokenAmount] of trades) {
    console.log(`Pool: ${poolAddress}`)
    const pool = Pool__factory.connect(poolAddress, owner)
    console.log(`Base: ${await pool.baseToken()}`)
    const base = ERC20__factory.connect(await pool.baseToken(), owner)
    console.log(`FYToken: ${await pool.fyToken()}`)
    const fyToken = FYToken__factory.connect(await pool.fyToken(), owner)
    console.log(`Join: ${await fyToken.join()}`)
    const join = Join__factory.connect(await fyToken.join(), owner);
  
    console.log(`Developer: ${developer}`);
    console.log(`Balance: ${await base.balanceOf(developer)}`);
    (await base.transfer(join.address, tokenAmount)).wait(1);
    console.log(`Transferred ${tokenAmount} to join`);
    (await fyToken.mintWithUnderlying(pool.address, tokenAmount)).wait(1);
    console.log(`Minted ${tokenAmount} fyToken`);
    (await pool.sellFYToken(ZERO_ADDRESS, 0)).wait(1);
    console.log(`Sold ${tokenAmount} fyToken`);
  }
})()
