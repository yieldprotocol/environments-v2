import { ethers, waffle } from 'hardhat'
import { BaseProvider } from '@ethersproject/providers'
import { VaultEnvironment } from '../fixtures/vault'
import { THREE_MONTHS } from '../shared/constants';
import { transferFromFunder } from '../shared/helpers';

/**
 * 
 * README
 * 
 * Change these parameters/lists:
 * 
 * ilks: symbol string OR address of predeployed token  AND a whale account for funding test tokens
 * bases: symbol string only 
 * maturities: leave blank for autogeneration 
 * externalTestAccounts: add any account to be funded with test ETH and tokens
 * buildVaults: whether or not to build test vault in owner account
 * numberOfMaturities: number of maturities to generate ( only applicable if maturities[] is empty )
 * 
 */
 const ilks: string[][] =  [ 
     ['0x6b175474e89094c44da98b954eedeac495271d0f', '0x13aec50f5d3c011cd3fed44e2a30c515bd8a5a06' ],  // DAI + funderAcc
     //['0xdac17f958d2ee523a2206206994597c13d831ec7', '0xb3f923eabaf178fc1bd8e13902fc5c61d3ddef5b'],  // USDT  + funderAcc
     //['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', '0x269d74be03b635e73c5f2454f6baa41ced16406e'], // WBTC + funderAcc
     //['0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', '0xb045fa6893b26807298e93377cbb92d7f37b19eb'], // UNI + funderAcc
     ['USDC',''],
     ['USDT',''],
     ['TST', ''], // mock token example ( tokens are minted, no funder needed)
    ]
 const bases: string[] = ['DAI']
 const maturities: number[] = []
 const externalTestAccounts = [ "0x885Bc35dC9B10EA39f2d7B3C94a7452a9ea442A7" ]
 const buildVaults = false
 const numberOfMaturities = 5
 /**
 * 
 * run:
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

const { loadFixture } = waffle
console.time("Environment deployed in");

const generateMaturities = async (n:number) => {
    const provider: BaseProvider = await ethers.provider 
    const now = (await provider.getBlock(await provider.getBlockNumber())).timestamp
    let count: number = 1
    const maturities = Array.from({length: n}, () => now + THREE_MONTHS * count++ );
    return maturities;
}

const fundExternalAccounts = async (assetList:Map<string, any>) => {

    const [ ownerAcc ] = await ethers.getSigners();
    await Promise.all(
        externalTestAccounts.map((to:string)=> {
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
    console.log('External accounts funded with 100ETH, and 1000 of each asset')
};
 
const fixture = async () =>  {
    const [ ownerAcc ] = await ethers.getSigners();    
    const vaultEnv = await VaultEnvironment.setup(
        ownerAcc,
        ilks,
        bases, 
        maturities.length ? maturities : await generateMaturities(numberOfMaturities), // if maturities list is empty, generate them
        buildVaults
    )
    return vaultEnv
}

loadFixture(fixture).then( async ( vaultEnv : VaultEnvironment )  => { 

    console.log(`"Cauldron": "${vaultEnv.cauldron.address}",`)
    console.log(`"Ladle" : "${vaultEnv.ladle.address}",`)
    console.log(`"Witch" : "${vaultEnv.witch.address}"`)
    console.log(`"PoolRouter" : "${vaultEnv.poolRouter.address}"`)
    
    console.log('Assets:')
    vaultEnv.assets.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })

    console.log('Oracles:')
    vaultEnv.oracles.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })
    
    console.log('Series:')
    vaultEnv.series.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })
    
    console.log('Joins:')
    vaultEnv.joins.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })

    buildVaults && console.log('Vaults:')
    buildVaults && vaultEnv.vaults.forEach((value:any, key:any) => console.log(value))

    console.log('Pools:')
    vaultEnv.pools.forEach((value:any, key:any)=>{    
        value.forEach(async (v:any,k:any) => {
            console.log(`"${k}" : "${v.address}",`)
        })
    })

    await fundExternalAccounts(vaultEnv.assets);

    console.timeEnd("Environment deployed in")
    return vaultEnv;

}

);