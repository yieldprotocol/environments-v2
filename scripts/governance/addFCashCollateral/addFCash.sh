#!/bin/bash

set -eux
HERE=$(dirname $0)
RUN="npx hardhat run --network rinkeby"
export CONF=$PWD/$HERE/addFCash.rinkeby.config

$RUN $HERE/addFCash-1.ts # Deploy Oracle
$RUN $HERE/addFCash-2.ts # Deploy Module
$RUN $HERE/addFCash-3.ts # Deploy Join

$RUN $HERE/addFCash-4.ts # Orchestrate Join, add asset, make ilk, add ilk to series - propose
$RUN $HERE/addFCash-4.ts # Orchestrate Join, add asset, make ilk, add ilk to series - approve
$RUN $HERE/addFCash-4.ts # Orchestrate Join, add asset, make ilk, add ilk to series - execute
