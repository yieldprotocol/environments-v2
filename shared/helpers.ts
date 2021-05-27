import { ethers, network, run } from 'hardhat'
import { BigNumber } from 'ethers'
import { BaseProvider } from '@ethersproject/providers'
import { THREE_MONTHS } from './constants';

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

export const generateMaturities = async (n:number) => {
  const provider: BaseProvider = await ethers.provider 
  const now = (await provider.getBlock(await provider.getBlockNumber())).timestamp
  let count: number = 1
  const maturities = Array.from({length: n}, () => now + THREE_MONTHS * count++ );
  return maturities;
}

export const fundExternalAccounts = async (assetList:Map<string, any>, accountList:Array<string>) => {
  const [ ownerAcc ] = await ethers.getSigners();
  await Promise.all(
      accountList.map((to:string)=> {
          /* add test Eth */
          ownerAcc.sendTransaction({to,value: ethers.utils.parseEther("100")})
          /* add test asset[] values (if not ETH) */
          assetList.forEach(async (value:any, key:any)=> {
              if (key !== '0x455448000000') {
                  await value.transfer(to, ethers.utils.parseEther("1000"))
              }
          })
      })
  )
  console.log('External test accounts funded with 100ETH, and 1000 of each asset')
};

export function bytesToString(bytes: string): string {
  return ethers.utils.parseBytes32String(bytes + '0'.repeat(66 - bytes.length))
}

export function stringToBytes6(x: string): string {
  return ethers.utils.formatBytes32String(x).slice(0, 14)
}

export function verify(address: string, args: any, libs?: any) {
  if (network.name !== 'localhost') {
    setTimeout(() => { run("verify:verify", {
      address: address,
      constructorArguments: args,
      libraries: libs,
    }) }, 60000)
  }
}


/* MAP to Json for file export */
export function mapToJson(map: Map<any,any>) : string {
  return JSON.stringify(flattenContractMap(map),
    /* replacer */
    (key: any, value: any) =>  {
      if(value instanceof Map) {
        return {
          dataType: 'Map',
          value:  [...value],
        };
      } else {
        return value;
      }
    });
}

export function flattenContractMap(map: Map<string,any>): Map<string, string> {
  const flat = new Map<string, string>()
  map.forEach((value: any, key: string) => {
    flat.set(key, value.address !== undefined ? value.address : value)
  })
  return flat
}

export function toAddress(obj: any) : string {
  return obj.address !== undefined ? obj.address : obj
}

export function jsonToMap(json:string) : Map<any,any> {
  return JSON.parse(json, 
    /* revivor */
    (key: any, value: any) =>  {
      if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
          return new Map(value.value);
        }
      }
      return value;
    }); 
}
