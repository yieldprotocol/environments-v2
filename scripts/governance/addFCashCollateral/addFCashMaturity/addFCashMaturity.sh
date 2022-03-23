#!/bin/bash

set -eux
HERE=$(dirname $0)
RUN="npx hardhat run --network rinkeby"
export CONF=$PWD/$HERE/addFCash.rinkeby.config

$RUN $HERE/addFCashMaturity-1.ts # Deploy Join

$RUN $HERE/addFCashMaturity-2.ts # Orchestrate Join, add asset, make ilk, add ilk to series - propose
$RUN $HERE/addFCashMaturity-2.ts # Orchestrate Join, add asset, make ilk, add ilk to series - approve
$RUN $HERE/addFCashMaturity-2.ts # Orchestrate Join, add asset, make ilk, add ilk to series - execute
