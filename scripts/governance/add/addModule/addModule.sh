#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addModule.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/addModule.ts
$RUN $HERE/addModule.ts
$RUN $HERE/addModule.ts
