import { ethers } from "hardhat";
import { advanceTime, readAddressMappingIfExists } from "../shared/helpers";
import { IPoolOracle__factory, Pool__factory } from "../typechain";

async function main() {
  const [deployer] = await ethers.getSigners();

  const protocol = readAddressMappingIfExists('protocol.json')
  const pools = Array.of(...readAddressMappingIfExists('pools.json').values())

  const poolOracle = IPoolOracle__factory.connect(protocol.getOrThrow("poolOracle")!, deployer);

  const now = (await ethers.provider.getBlock(ethers.provider.getBlockNumber())).timestamp

  const activePools =
    (await Promise.all(pools.map(async (address) => ({ address, maturity: (await Pool__factory.connect(address, deployer).maturity()) }))))
      .filter(({ maturity }) => maturity > now)

  const idlePools =
    (await Promise.all(activePools.map(async ({ address }) => ({ address, updated: await poolOracle.callStatic["update(address)"](address) }))))
      .filter(({ updated }) => updated)
      .map(({ address }) => address)

  if (idlePools.length > 0) {
    console.log("Pools to update:", idlePools)
    
    const tx = await poolOracle["update(address[])"](idlePools)
    await tx.wait(1)

    await advanceTime(60 * 5);
  } else {
    console.log("All pools are up to date in the oracle")
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
