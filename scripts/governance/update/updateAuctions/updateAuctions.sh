#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateAuctions.arb_mainnet.config
RUN="npx hardhat run --network arb_mainnet"

# $RUN $HERE/updateAuctions.ts
# $RUN $HERE/updateAuctions.ts
$RUN $HERE/updateAuctions.ts

# $RUN $HERE/updateAuctions.test.ts 