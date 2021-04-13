import { ethers, waffle } from 'hardhat'
import { VaultEnvironment } from '../fixtures/vault'

/**
 * 
 * README: 
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

const { loadFixture } = waffle
console.time("Environment deployed in");

const series:Uint8Array[] = Array.from({length: 5}, () => ethers.utils.randomBytes(6));
const ilks: string[] = ['DAI', 'USDC', 'USDT']
const bases: string[] = ['DAI', 'USDC']

const externalTestAccounts = [
    "0x885Bc35dC9B10EA39f2d7B3C94a7452a9ea442A7",
]

const fundExternalAccounts = async (assetList:Map<string, any>) => {
    const [ ownerAcc ] = await ethers.getSigners();
    await Promise.all(
        externalTestAccounts.map((to:string)=> {
            /* add test Eth */
            ownerAcc.sendTransaction({to,value: ethers.utils.parseEther("100")})
            /* add test asset[] values (if not ETH) */
            assetList.forEach(async (value:any, key:any)=> {
                if (key !== '0x455448000000') await value.transfer(to, ethers.utils.parseEther("1000")); 
            })
        })
    )
    console.log('External accounts funded with 100ETH, and 1000 of each asset')
};

const fixture = async () =>  {
    const [ ownerAcc ] = await ethers.getSigners();

    // const maturity = now + THREE_MONTHS * count++
    
    const vaultEnv = await VaultEnvironment.setup(
        ownerAcc,
        ilks,
        bases, 
        // maturities,
        series.map((series:Uint8Array ) => ethers.utils.hexlify(series)),
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

    console.log('Vaults:')
    vaultEnv.vaults.forEach((value:any, key:any) => console.log(value))

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