#!/bin/bash

set -euo pipefail
VAULT_ID=$1

function print_asset_info() {
    ASSET_ID=$1
    read ADDRESS < <(seth call --rpc-url $RPC_URL $CAULDRON "assets(bytes6)(address)" $ASSET_ID)
    read DECIMALS < <(seth call --rpc-url $RPC_URL $ADDRESS "decimals()(uint8)")
    read SYMBOL < <(seth call --rpc-url $RPC_URL $ADDRESS "symbol()(string)")
    echo -e "\t\tAddress: $ADDRESS"
    echo -e "\t\tDecimals: $DECIMALS"
    echo -e "\t\tSymbol: $SYMBOL"
}

function format_erc20_balance() {
    INPUT_BALANCE=$1
    BALANCE=$(awk "BEGIN { print $INPUT_BALANCE / 1e$DECIMALS }")
}

read -d\$'\1' OWNER SERIES_ID ILK_ID < <(seth call --rpc-url $RPC_URL $CAULDRON "vaults(bytes12)(address,bytes6,bytes6)" $VAULT_ID) || true
echo "Owner: $OWNER"

echo "Ilk"
read -d\$'\1' DEBT COLLATERAL < <(seth call --rpc-url $RPC_URL $CAULDRON "balances(bytes12)(uint128,uint128)" $VAULT_ID) || true
echo -e "\tAsset ID: $ILK_ID"
print_asset_info $ILK_ID
format_erc20_balance $COLLATERAL
echo -e "\tCollateral: $BALANCE"

echo "Series"
read -d\$'\1' FY_TOKEN BASE_ID MATURITY < <(seth call --rpc-url $RPC_URL $CAULDRON "series(bytes6)(address,bytes6,uint32)" $SERIES_ID) || true
echo -e "\tID: $SERIES_ID"
echo -e "\tBase Asset ID: $BASE_ID"
print_asset_info $BASE_ID
format_erc20_balance $DEBT
echo -e "\tDebt: $BALANCE"


read -d\$'\1' LEVEL < <(seth call --rpc-url $RPC_URL $CAULDRON "level(bytes12)(int128)" $VAULT_ID) || true
echo "Level: $LEVEL"

read -d\$'\1' SPOT_ORACLE RATIO < <(seth call --rpc-url $RPC_URL $CAULDRON "spotOracles(bytes6,bytes6)(address,uint32)" $BASE_ID $ILK_ID) || true
RATIO_PCT=$(awk "BEGIN { print $RATIO / 1e4 }")
echo "Spot oracle: $SPOT_ORACLE; ratio: $RATIO_PCT%"
