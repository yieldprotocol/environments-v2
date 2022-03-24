#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addGovernors.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/addGovernors.ts
$RUN $HERE/addGovernors.ts
$RUN $HERE/addGovernors.ts