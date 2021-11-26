import { ethers } from 'hardhat'
import * as hre from 'hardhat'

;(async () => {
  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708","0x1000000000000000000000"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708")
})()
