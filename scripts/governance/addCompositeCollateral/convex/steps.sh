#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addCvx3Crv.config
export BASE=$PWD/scripts/governance/base.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/deployCvx3CrvLadleModule.ts
$RUN $HERE/deployCVX3CRVOracle.ts
$RUN $HERE/deployConvexJoin.ts
$RUN $HERE/addCvx3Crv-2.ts
$RUN $HERE/addCvx3Crv-2.ts
$RUN $HERE/addCvx3Crv-2.ts
$RUN $HERE/addCvx3Crv-5.ts
$RUN $HERE/addCvx3Crv-5.ts
$RUN $HERE/addCvx3Crv-5.ts
$RUN $HERE/addConvexAsset.ts
$RUN $HERE/addConvexAsset.ts
$RUN $HERE/addConvexAsset.ts