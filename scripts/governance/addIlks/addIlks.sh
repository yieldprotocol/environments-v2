#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addIlks.rinkeby.config
RUN="npx hardhat run --network rinkeby"

$RUN $HERE/addIlks.ts
$RUN $HERE/addIlks.ts
$RUN $HERE/addIlks.ts