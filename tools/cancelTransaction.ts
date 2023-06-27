import { ethers } from "hardhat";


;(async () => {
  const owner = (await ethers.getSigners())[0];
  owner.sendTransaction({to: owner.address, value: ethers.utils.parseEther("0"), gasPrice: 150_000_000_000, nonce: 483});
})()
