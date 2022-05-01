#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addModule.rinkeby.config
RUN="npx hardhat run --network rinkeby"

$RUN $HERE/addModule.ts
$RUN $HERE/addModule.ts
$RUN $HERE/addModule.ts