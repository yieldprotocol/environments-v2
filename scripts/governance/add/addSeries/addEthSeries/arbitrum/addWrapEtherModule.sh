#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthSeries.arb_mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../deployWrapEtherModule.ts

$RUN $HERE/addWrapEtherModule.ts
$RUN $HERE/addWrapEtherModule.ts
$RUN $HERE/addWrapEtherModule.ts
# $RUN $HERE/addWrapEtherModule.test.ts