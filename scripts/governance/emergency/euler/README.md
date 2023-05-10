1. restoreLadle.sh
2. restoreMarchFYToken.sh
3. restoreSepStrategies.sh
4. sepStrategyTokenSwap.sh
5. restoreJunStrategies.sh
6. migrateJunDebt.sh
7. junStrategyTokenSwap.sh

Timelock balances before hack:
ETH: 999 999999 999997
DAI: 5166 409160 352125 558200
USDC: 999998
USDT: 0
FRAX: 999999 999999 999999

Pool balances at the time of the hack:
Pool: 0x1b2145139516cB97568B76a2FdbE37D2BCD61e63
Series: FYETH2303
Pool base:               77039085925625204682
Pool fyToken:            49006807052994229991
Combined:                126045892978619434673
Ratio:                   1.57200786091
fyTokenIn:               38.8801300026

Pool: 0xBdc7Bdae87dfE602E91FDD019c4C0334C38f6A46
Series: FYDAI2303
Pool base:               352761692860250054914429
Pool fyToken:            155742829126709002996692
Combined:                508504521986959057911121
Ratio:                   2.2650268705
fyTokenIn:               30.6276193019

Pool: 0x48b95265749775310B77418Ff6f9675396ABE1e8
Series: FYUSDC2303
Pool base:               433973348230
Pool fyToken:            480444924178
Combined:                914418272408
Ratio:                   0.90327387467
fyTokenIn:               52.5410458951

Pool: 0x7472DF92Ae587f97939de92bDFC23dbaCD8a3816
Series: FYUSDT2303
Pool base:               193409613
Pool fyToken:            0
Combined:                193409613
Ratio:                   -
fyTokenIn:               0

Pool: 0xD129B0351416C75C9f0623fB43Bb93BB4107b2A4
Series: FYETH2306
Pool base:               118558655885687900045
Pool fyToken:            50675197444676562033
Combined:                169233853330364462078
Ratio:                   2.33957955497
fyTokenIn:               29.9438891495

Pool: 0xC2a463278387e649eEaA5aE5076e283260B0B1bE
Series: FYDAI2306
Pool base:               111482877536775337484111
Pool fyToken:            66529338304461559897704
Combined:                178012215841236897381815
Ratio:                   1.67569496974
fyTokenIn:               37.3734678769

Pool: 0x06aaF385809c7BC00698f1E266eD4C78d6b8ba75
Series: FYUSDC2306
Pool base:               159360793343
Pool fyToken:            478767006484
Combined:                638127799827
Ratio:                   0.33285667388
fyTokenIn:               75.0268216829

Pool: 0xB4DbEc738Ffe47981D337C02Cb5746E456ecd505
Series: FYUSDT2306
Pool base:               96708056
Pool fyToken:            0
Combined:                96708056
Ratio:                   -
fyTokenIn:               0


Timelock balances after restoration:
ETH: 516146845877006550
DAI: 20048939004992741978308
USDC: 20311373131
USDT: 129827777
FRAX: 999999999999999998
YSETH6MJD: 173876717527907390911
YSDAI6MJD: 182026100521581669692081
YSUSDC6MJD: 647405622307
YSUSDT6MJD: 0
YSETH6MMS: 128106015354872300000
YSDAI6MMS: 516290007194613000000000
YSUSDC6MMS: 926769085322
YSUSDT6MMS: 0

Pool balances after restoration:

Pool: 0xd06b8a687eB30cb6EE6410655d361cfB87F6b6da
Series: FYETH2309
Pool cached base:        79199208301878100000
Pool cached fyToken:     49322501621831715568
Pool ratio:              1605741


Pool: 0x4BDD8761e730C6523562a011FD799b019BD46dfb
Series: FYDAI2309
Pool cached base:        360647178067904000000000
Pool cached fyToken:     156176800546684895317810
Pool ratio:              2309223


Pool: 0xBB5d1466bb671BE9b8Ff0f10Bcb761C386694600
Series: FYUSDC2309
Pool cached base:        446424161144
Pool cached fyToken:     482393804036
Pool ratio:              925435


Pool: 0x34Cce6324576b9d31E01c36303CFb9438dc0AB76
Series: FYUSDT2309
Pool cached base:        100000000
Pool cached fyToken:     0
Pool ratio:              0

Pool: 0x60995D90B45169eB04F1ea9463443a62B83ab1c1
Series: FYETH2306B
Pool cached base:        122926791632155720855
Pool cached fyToken:     51137393239489811000
Pool ratio:              2403853


Pool: 0x1488646B72A188C82e0B35E0c28A3183E663e93f
Series: FYDAI2306B
Pool cached base:        115068005818635217939481
Pool cached fyToken:     67138863944130937500000
Pool ratio:              1713880


Pool: 0x9d9DcF0035dB75F822A90a1d411aeB49F3ffc384
Series: FYUSDC2306B
Pool cached base:        166181230155
Pool cached fyToken:     482374497345
Pool ratio:              344506


Pool: 0x8b5875837679DF564CAf260266a466Cce12F350f
Series: FYUSDT2306B
Pool cached base:        100000000
Pool cached fyToken:     0
Pool ratio:              0

alcueca@localhost environments-v2 %    