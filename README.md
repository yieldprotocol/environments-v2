External contract links:
 - [Yearn Vault deployed token contracts](https://yearn.github.io/yearn-devdocs/getting-started/products/yvaults/vault-tokens) -- [github](https://github.com/yearn/yearn-vaults/blob/main/contracts/Vault.vy)
 - [Curve deployed contract addresses](https://curve.readthedocs.io/ref-addresses.html) -- [github](https://github.com/curvefi/curve-contract/tree/master/contracts)
 - [Lido deployed contracts (stEth and wstEth)](https://docs.lido.fi/deployed-contracts)

---

Start a local environment:
`npx hardhat node` 

OPTIONAL: Start a mainnet forked env: 
`npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/1Ywbr_Hku2pWR5BTgV9hxyoGaDWX0AoF`
*currently a bit tempramental, use cautiously

then run the environment of choice, eg.
`npx hardhat run ./environments/development.ts --network localhost`

then run the unit tests of choice, eg.
`npx hardhat test test/011_oracle.ts --network localhost`

to add an asset as an ilk to an already deployed protocol (say, for instance, add WBTC as an ilk where DAI and USDC are already bases):
`npx hardhat --show-stack-traces --network localhost add --ilk 0x46b142DD1E924FAb83eCc3c08e4D46E82f005e0E 0xC9a43158891282A2B1475592D5719c001986Aaec DAI 0x1c85638e118b37167e9298c2268758e058DdfDA0 USDC` where:

`0x46b142DD1E924FAb83eCc3c08e4D46E82f005e0E` is WBTC's address
`0xC9a43158891282A2B1475592D5719c001986Aaec` is the spot source for WBTC/`DAI`
`0x1c85638e118b37167e9298c2268758e058DdfDA0` is the spot source for WBTC/`USDC`

to add an asset as a base to an already deployed protocol (say, for instance, add USDT as a base where DAI, USDC, ETH and TST are already assets):
`npx hardhat --show-stack-traces --network localhost add --base 0x46b142DD1E924FAb83eCc3c08e4D46E82f005e0E 1630919140 0xC9a43158891282A2B1475592D5719c001986Aaec 0x1c85638e118b37167e9298c2268758e058DdfDA0 0x367761085BF3C12e5DA2Df99AC6E1a824612b8fb DAI 0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901 USDC 0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9 ETH 0x49fd2BE640DB2910c2fAb69bB8531Ab6E76127ff TST` where:

`0x46b142DD1E924FAb83eCc3c08e4D46E82f005e0E` is USDT's address
`1630919140` is the maturity for the series that will be created for USDT
`0xC9a43158891282A2B1475592D5719c001986Aaec` is the rate source for USDT
`0x1c85638e118b37167e9298c2268758e058DdfDA0` is the chi source for USDT
`0x367761085BF3C12e5DA2Df99AC6E1a824612b8fb` is the spot source for USDT/`DAI`
`0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901` is the spot source for USDT/`USDC`
`0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9` is the spot source for USDT/`ETH`