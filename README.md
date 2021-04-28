Start a mainnet forked env: 
`npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/1Ywbr_Hku2pWR5BTgV9hxyoGaDWX0AoF`

then run the environment of choice, eg.
`npx hardhat run ./environments/development.ts --network localhost`

then run the unit tests of choice, eg.
`npx hardhat test test/011_oracle.ts --network localhost`
