import { ethers, network } from 'hardhat'
import { BigNumber } from 'ethers'

export const transferFromFunder = async ( 
    tokenAddress:string,
    recipientAddress: string,
    amount: BigNumber,
    funderAddress: string,
  )  => {
    const tokenContract = await ethers.getContractAt('ERC20', tokenAddress)
    const tokenSymbol = await tokenContract.symbol()
    try {
        console.log(
          `Attempting to move ${ethers.utils.formatEther(amount)} ${tokenSymbol} from whale account ${funderAddress} to account ${recipientAddress}`
        )
        /* if using whaleTransfer, impersonate that account, and transfer token from it */
        await network.provider.request({
          method: "hardhat_impersonateAccount",
          params: [funderAddress]}
        )
        const _signer = await ethers.provider.getSigner(funderAddress)
        const _tokenContract = await ethers.getContractAt('ERC20', tokenAddress, _signer)
        await _tokenContract.transfer(recipientAddress, amount)
        console.log('Transfer Successful.')

        await network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: [funderAddress]}
        )
    } catch (e) { 
      console.log(
          `Warning: Failed transferring ${tokenSymbol} from whale account. Some protocol features related to this token may not work`, e)
    }
}