const Members = () => {
  // Rank hierarchy from highest to lowest
  const rankHierarchy = [
    'Alpha', 'Mythwalker', 'Elite Assassins', 'Ramen', 'Apex hunters', 'Crimson fangs', 
    'Darkwatch', 'Ghost vanguards', 'Surv-Player-SSS', 'Surv-Player-SS', 'Surv-Player-S', 
    'Surv-player-A', 'Surv-Player-B', 'volley-players-SSS', 'volley-players-SS', 
    'volley-players-S', 'volley-players-A', 'volley-players-B', 'Amine ZBI Raghib', 
    'Iron sentinels', 'Storm Fighters', 'Blade strategists', 'Whisper killers', 
    'Volley Makaynsh', 'Ana w9', 'Battleborn'
  ];

  // Real members data parsed from the members.txt file
  const rawMembersData = [
    { name: 'Aaoozza #0000', rank: 'Battleborn', joinDate: '24/12/2023 22:37' },
    { name: 'Abdo #3374', rank: 'Battleborn', joinDate: '23/10/2023 22:04' },
    { name: 'Ada #0303', rank: 'Battleborn', joinDate: '05/03/2024 01:13' },
    { name: 'Adar586 #1438', rank: 'Storm Fighters', joinDate: '04/12/2023 00:35' },
    { name: 'Afrancoa #0000', rank: 'Ghost vanguards', joinDate: '05/07/2024 10:52' },
    { name: 'Ahmedpr0 #0000', rank: 'volley-players-A', joinDate: '15/06/2025 23:26' },
    { name: 'Akaaaaaaaame #2255', rank: 'Battleborn', joinDate: '24/03/2024 17:51' },
    { name: 'Akt #7210', rank: 'Battleborn', joinDate: '14/06/2025 14:18' },
    { name: 'Aleboss1233 #8748', rank: 'Battleborn', joinDate: '12/07/2025 14:05' },
    { name: 'Alekku #1673', rank: 'Elite Assassins', joinDate: '02:21' },
    { name: 'Alien #5915', rank: 'Battleborn', joinDate: '10/07/2025 13:17' },
    { name: 'Alonealqenxd #0000', rank: 'Battleborn', joinDate: '31/05/2025 12:04' },
    { name: 'Amer_amer #0000', rank: 'Alpha', joinDate: '07/09/2024 23:18' },
    { name: 'Amiraz_22 #4623', rank: 'Whisper killers', joinDate: '19/08/2024 00:46' },
    { name: 'Angeldevil #0367', rank: 'Battleborn', joinDate: '13/03/2024 01:37' },
    { name: 'Apolo #4216', rank: 'Battleborn', joinDate: '04/06/2025 12:33' },
    { name: 'Ari #9203', rank: 'Whisper killers', joinDate: '15/11/2023 14:07' },
    { name: 'Asurv #4732', rank: 'Battleborn', joinDate: '15/11/2023 19:37' },
    { name: 'Austraaalb0y #6756', rank: 'volley-players-B', joinDate: '17/06/2025 01:04' },
    { name: 'Ayaaa #8048', rank: 'Battleborn', joinDate: '09/11/2024 22:43' },
    { name: 'Ayanoo #8139', rank: 'Mythwalker', joinDate: '07/09/2023 13:45' },
    { name: 'Babygurl #6265', rank: 'Iron sentinels', joinDate: '17/11/2024 02:30' },
    { name: 'Barsetohnik #0000', rank: 'volley-players-B', joinDate: '06/06/2025 20:15' },
    { name: 'Basda #3161', rank: 'Iron sentinels', joinDate: '12/07/2025 15:39' },
    { name: 'Ramasevosaff #0000', rank: 'Ramen', joinDate: '26/07/2025 23:19' },
    { name: 'Beautydoha #0000', rank: 'Apex hunters', joinDate: '30/05/2024 17:01' },
    { name: 'Bunny #9332', rank: 'Amine ZBI Raghib', joinDate: '08/08/2025 03:01' },
    { name: 'Bibi #8389', rank: 'volley-players-S', joinDate: '08/07/2025 23:18' },
    { name: 'Bingo #9580', rank: 'Whisper killers', joinDate: '22/09/2023 22:36' },
    { name: 'Blackmice #3370', rank: 'Battleborn', joinDate: '23/12/2023 21:34' },
    { name: 'Bmz #9943', rank: 'volley-players-SS', joinDate: '30/05/2025 21:03' },
    { name: 'Bojje #2327', rank: 'Elite Assassins', joinDate: '09/06/2025 21:14' },
    { name: 'Caffy #1229', rank: 'Mythwalker', joinDate: '20/07/2025 03:43' },
    { name: 'Christianix #0000', rank: 'volley-players-B', joinDate: '04/07/2025 19:37' },
    { name: 'Chris_cc #4551', rank: 'Storm Fighters', joinDate: '01/02/2025 17:13' },
    { name: 'Citaflor #0000', rank: 'Battleborn', joinDate: '11/12/2023 01:15' },
    { name: 'Coldesgirll #0783', rank: 'Surv-Player-B', joinDate: '04/06/2025 16:12' },
    { name: 'Coqyne #3748', rank: 'volley-players-S', joinDate: '08/06/2025 12:31' },
    { name: 'Cox #1730', rank: 'Apex hunters', joinDate: '23/07/2025 20:39' },
    { name: 'Crawen #1820', rank: 'Battleborn', joinDate: '30/07/2024 18:49' },
    { name: 'Damla #5276', rank: 'volley-players-S', joinDate: '14/07/2025 21:18' },
    { name: 'Deerla #3885', rank: 'Battleborn', joinDate: '11/10/2023 14:23' },
    { name: 'Denisatomi #0000', rank: 'Battleborn', joinDate: '23/05/2025 12:34' },
    { name: 'Devillina #2332', rank: 'volley-players-S', joinDate: '11/07/2025 16:58' },
    { name: 'Die #4893', rank: 'volley-players-B', joinDate: '16/11/2024 00:45' },
    { name: 'Doflamingo #0611', rank: 'Darkwatch', joinDate: '30/11/2023 17:55' },
    { name: 'Doudi #5304', rank: 'Battleborn', joinDate: '24/05/2025 13:04' },
    { name: 'Drafid #0000', rank: 'Battleborn', joinDate: '17/07/2025 21:59' },
    { name: 'D_n #1135', rank: 'Battleborn', joinDate: '09/02/2025 22:43' },
    { name: 'Ecrinaksyy_0 #9842', rank: 'volley-players-B', joinDate: '17/05/2025 12:04' },
    { name: 'Edotensai #0671', rank: 'Battleborn', joinDate: '31/03/2024 16:55' },
    { name: 'Eleonorka #1853', rank: 'volley-players-A', joinDate: '30/05/2025 12:43' },
    { name: 'Eminem #5178', rank: 'Ghost vanguards', joinDate: '24/02/2024 02:53' },
    { name: 'Exodiax3 #5848', rank: 'volley-players-A', joinDate: '10/06/2025 15:13' },
    { name: 'Feellikeadog #0000', rank: 'Battleborn', joinDate: '07/08/2025 01:20' },
    { name: 'Fioletowyfio #0000', rank: 'Surv-player-A', joinDate: '23/07/2025 11:40' },
    { name: 'Floppa_top69 #3899', rank: 'Iron sentinels', joinDate: '15/03/2025 12:05' },
    { name: 'Fnair #0000', rank: 'Battleborn', joinDate: '26/05/2025 19:19' },
    { name: 'Fodi #7031', rank: 'volley-players-B', joinDate: '10/10/2024 00:50' },
    { name: 'Fortchin #0000', rank: 'Battleborn', joinDate: '06/08/2024 18:25' },
    { name: 'Fox #7680', rank: 'Ghost vanguards', joinDate: '25/09/2023 18:01' },
    { name: 'Freexx #3738', rank: 'Blade strategists', joinDate: '10/08/2025 04:36' },
    { name: 'Gen_z_ender #8280', rank: 'volley-players-B', joinDate: '03/07/2025 12:45' },
    { name: 'Gestranius #0000', rank: 'Battleborn', joinDate: '05/07/2025 14:01' },
    { name: 'Giannis #3170', rank: 'Surv-Player-SSS', joinDate: '21/07/2025 09:26' },
    { name: 'Girl_max #4560', rank: 'Surv-Player-S', joinDate: '01/09/2024 19:34' },
    { name: 'Girl_max #6199', rank: 'Surv-Player-S', joinDate: '24/01/2024 21:01' },
    { name: 'Glatias #0000', rank: 'Surv-Player-B', joinDate: '07/04/2024 21:17' },
    { name: 'Golden #2261', rank: 'Elite Assassins', joinDate: '13/05/2025 00:44' },
    { name: 'Goldenfate #0000', rank: 'Battleborn', joinDate: '10/08/2025 14:23' },
    { name: 'Gorczek #6341', rank: 'volley-players-S', joinDate: '30/05/2025 12:33' },
    { name: 'Haytam #0000', rank: 'volley-players-SS', joinDate: '07/06/2025 15:17' },
    { name: 'Haytam_sh #6448', rank: 'Storm Fighters', joinDate: '17/05/2025 15:14' },
    { name: 'Hivere #0000', rank: 'volley-players-A', joinDate: '06/07/2025 22:25' },
    { name: 'Htm1997 #0000', rank: 'volley-players-A', joinDate: '06/07/2025 01:30' },
    { name: 'Itachi #3479', rank: 'Battleborn', joinDate: '21/01/2025 23:42' },
    { name: 'Ivanna #9487', rank: 'Battleborn', joinDate: '23/05/2025 17:01' },
    { name: 'Jakb00t #0000', rank: 'Battleborn', joinDate: '01/06/2025 12:26' },
    { name: 'Jamix #9382', rank: 'Battleborn', joinDate: '17/09/2024 23:05' },
    { name: 'Jecakragulj1 #0000', rank: 'volley-players-S', joinDate: '06/07/2025 13:54' },
    { name: 'Jenji #1475', rank: 'Jenji', joinDate: '06/08/2025 02:00' },
    { name: 'Jenji #4662', rank: 'volley-players-SSS', joinDate: '06/07/2025 14:03' },
    { name: 'Joe_dalton #1940', rank: 'Battleborn', joinDate: '04/02/2025 22:50' },
    { name: 'Jojogween #0482', rank: 'Battleborn', joinDate: '12/06/2025 20:43' },
    { name: 'K3you #4447', rank: 'Surv-Player-B', joinDate: '14/03/2024 17:35' },
    { name: 'Kalimoroll #0881', rank: 'Battleborn', joinDate: '23/01/2025 16:24' },
    { name: 'Kamikaze #3257', rank: 'Ghost vanguards', joinDate: '29/06/2025 21:52' },
    { name: 'Kaotar #7911', rank: 'volley-players-A', joinDate: '10/06/2025 21:05' },
    { name: 'Kasuho #0259', rank: 'Surv-player-A', joinDate: '04/01/2024 22:00' },
    { name: 'Kaytosinsi #7011', rank: 'Elite Assassins', joinDate: '09/07/2025 00:27' },
    { name: 'Keno #9229', rank: 'Storm Fighters', joinDate: '28/06/2025 22:04' },
    { name: 'Khalil9o0 #5086', rank: 'Battleborn', joinDate: '01/02/2025 17:44' },
    { name: 'Khalil9o0 #8798', rank: 'Ghost vanguards', joinDate: '23/01/2024 23:24' },
    { name: 'Kikawi_brooo #6880', rank: 'Storm Fighters', joinDate: '29/01/2025 00:24' },
    { name: 'Kimoshism #9294', rank: 'Battleborn', joinDate: '14/01/2025 17:43' },
    { name: 'Kraszujmnie #9631', rank: 'Battleborn', joinDate: '03/02/2024 23:09' },
    { name: 'Kzsy #7193', rank: 'Battleborn', joinDate: '11/10/2023 14:11' },
    { name: 'L3tay #6223', rank: 'Battleborn', joinDate: '12/07/2025 18:04' },
    { name: 'Lanatigresse #7227', rank: 'Surv-Player-B', joinDate: '25/11/2023 17:50' },
    { name: 'Lapte #4535', rank: 'volley-players-B', joinDate: '24/05/2025 20:35' },
    { name: 'Layan #2727', rank: 'Surv-player-A', joinDate: '11/07/2024 00:07' },
    { name: 'Lemhanna #8962', rank: 'Battleborn', joinDate: '21/07/2025 20:03' },
    { name: 'Lenosik228 #8495', rank: 'volley-players-B', joinDate: '07/06/2025 10:19' },
    { name: 'Lenteja #9244', rank: 'Battleborn', joinDate: '20/06/2024 16:05' },
    { name: 'Ligthjj #0000', rank: 'Battleborn', joinDate: '08/08/2025 09:34' },
    { name: 'Lion #9676', rank: 'Battleborn', joinDate: '29/08/2024 15:23' },
    { name: 'Lovegem #1662', rank: 'Battleborn', joinDate: '31/05/2025 11:54' },
    { name: 'Lowkey #8355', rank: 'Surv-Player-B', joinDate: '12/07/2025 19:26' },
    { name: 'Lucifer #5991', rank: 'Battleborn', joinDate: '08/09/2023 11:42' },
    { name: 'L_u_9 #0000', rank: 'volley-players-A', joinDate: '21/05/2025 23:47' },
    { name: 'Madkeleton #6381', rank: 'Battleborn', joinDate: '10/07/2025 20:02' },
    { name: 'Majx6 #3183', rank: 'Battleborn', joinDate: '24/12/2023 17:42' },
    { name: 'Mama516 #0000', rank: 'Surv-player-A', joinDate: '24/03/2025 09:30' },
    { name: 'Mamio007 #0000', rank: 'Battleborn', joinDate: '21/11/2024 14:44' },
    { name: 'Mangaba #2720', rank: 'Battleborn', joinDate: '15/06/2025 22:30' },
    { name: 'Mariem #6589', rank: 'volley-players-S', joinDate: '15/07/2025 01:36' },
    { name: 'Marlae06 #0000', rank: 'Surv-player-A', joinDate: '18/11/2023 22:24' },
    { name: 'Marssi #0401', rank: 'Battleborn', joinDate: '19/05/2025 17:50' },
    { name: 'Maryamgames #6217', rank: 'Blade strategists', joinDate: '11/01/2024 21:51' },
    { name: 'Maxstell #0000', rank: 'Battleborn', joinDate: '18/06/2024 16:57' },
    { name: 'Merry_chan #5550', rank: 'Battleborn', joinDate: '04/03/2024 15:30' },
    { name: 'Meryy06 #3534', rank: 'Battleborn', joinDate: '20/07/2025 18:43' },
    { name: 'Meteora #9119', rank: 'Storm Fighters', joinDate: '06/07/2025 19:21' },
    { name: 'Micimizi #0000', rank: 'Battleborn', joinDate: '09/08/2025 01:19' },
    { name: 'Min #1338', rank: 'volley-players-B', joinDate: '02/07/2025 14:35' },
    { name: 'Mmmtoo #0000', rank: 'Battleborn', joinDate: '11/01/2025 23:18' },
    { name: 'Mohamed_999 #2422', rank: 'Battleborn', joinDate: '04/08/2024 22:56' },
    { name: 'Mokmok #4290', rank: 'Battleborn', joinDate: '28/05/2025 20:59' },
    { name: 'Monawwwka #2709', rank: 'Battleborn', joinDate: '30/05/2025 11:56' },
    { name: 'Mousal #0000', rank: 'Surv-player-A', joinDate: '11/06/2024 17:03' },
    { name: 'Muichiro #4417', rank: 'Surv-player-A', joinDate: '27/07/2024 21:40' },
    { name: 'Murat #8694', rank: 'volley-players-B', joinDate: '03/07/2025 14:09' },
    { name: 'M_queen #0703', rank: 'Battleborn', joinDate: '18/06/2025 23:17' },
    { name: 'N9o0z #4191', rank: 'Battleborn', joinDate: '13/02/2025 03:53' },
    { name: 'Nadiagamer22 #0000', rank: 'Battleborn', joinDate: '07/03/2024 16:44' },
    { name: 'Nancwcw #5585', rank: 'Ghost vanguards', joinDate: '01/11/2024 18:18' },
    { name: 'Naoris #0000', rank: 'Iron sentinels', joinDate: '17/11/2024 02:28' },
    { name: 'Nathism #7893', rank: 'volley-players-B', joinDate: '09/06/2025 20:15' },
    { name: 'Nicol #1612', rank: 'volley-players-A', joinDate: '20/05/2025 21:08' },
    { name: 'Nkmk #3180', rank: 'volley-players-SSS', joinDate: '13/05/2025 15:54' },
    { name: 'Nkmk #9958', rank: 'Darkwatch', joinDate: '18/05/2025 12:40' },
    { name: 'Normi1098 #1383', rank: 'Battleborn', joinDate: '12/05/2025 23:04' },
    { name: 'Noz9o0 #0971', rank: 'Elite Assassins', joinDate: '01/05/2025 22:03' },
    { name: 'N_b #8388', rank: 'Surv-player-A', joinDate: '10/09/2023 00:50' },
    { name: 'Obito1 #4821', rank: 'volley-players-A', joinDate: '10/07/2025 21:35' },
    { name: 'Old #9724', rank: 'Whisper killers', joinDate: '03/08/2024 23:53' },
    { name: 'Orionn #6375', rank: 'Battleborn', joinDate: '16/07/2025 16:13' },
    { name: 'Otakukami #0356', rank: 'Battleborn', joinDate: '25/07/2025 01:18' },
    { name: 'Otakukami #3128', rank: 'Elite Assassins', joinDate: '10/10/2024 22:38' },
    { name: 'Otherfix #0000', rank: 'Battleborn', joinDate: '05/08/2025 00:53' },
    { name: 'Ournisako #0000', rank: 'Battleborn', joinDate: '04/08/2025 19:48' },
    { name: 'Petitemoulla #0607', rank: 'Battleborn', joinDate: '04/04/2024 22:49' },
    { name: 'Psg #5079', rank: 'Surv-player-A', joinDate: '29/04/2025 21:31' },
    { name: 'Pwerst #9704', rank: 'Blade strategists', joinDate: '10/10/2024 00:51' },
    { name: 'Quatrehuit #2495', rank: 'Surv-Player-SSS', joinDate: '09/08/2025 19:33' },
    { name: 'Raeisnotme #2294', rank: 'Battleborn', joinDate: '25/07/2025 09:09' },
    { name: 'Raidensnd #0000', rank: 'volley-players-SS', joinDate: '06/07/2025 02:22' },
    { name: 'Raisismail #0000', rank: 'Battleborn', joinDate: '16/07/2025 03:47' },
    { name: 'Ramasevosaff #0000', rank: 'Ramen', joinDate: '26/07/2025 23:19' },
    { name: 'Ramses0315 #8464', rank: 'Battleborn', joinDate: '21/07/2025 00:32' },
    { name: 'Ratatouy014 #8402', rank: 'Battleborn', joinDate: '09/07/2025 12:38' },
    { name: 'Raya #7196', rank: 'Battleborn', joinDate: '05/11/2023 22:03' },
    { name: 'Rivanabox #0000', rank: 'Battleborn', joinDate: '24/09/2023 23:54' },
    { name: 'Ronilaa #0000', rank: 'volley-players-A', joinDate: '05/07/2025 21:38' },
    { name: 'Roooobsa #0000', rank: 'Whisper killers', joinDate: '27/07/2024 22:30' },
    { name: 'Rosi #4765', rank: 'Battleborn', joinDate: '08/09/2023 13:46' },
    { name: 'Sa3obi #8563', rank: 'Battleborn', joinDate: '20/10/2023 22:05' },
    { name: 'Sadstar #6647', rank: 'volley-players-A', joinDate: '21/02/2025 18:01' },
    { name: 'Samuelkoth #6180', rank: 'Battleborn', joinDate: '30/05/2025 02:19' },
    { name: 'Sareraea #2484', rank: 'Battleborn', joinDate: '04/07/2025 23:27' },
    { name: 'Sawrot #0000', rank: 'Battleborn', joinDate: '21/07/2025 02:41' },
    { name: 'Sayuri #6875', rank: 'Storm Fighters', joinDate: '05/08/2025 23:56' },
    { name: 'Sfi #4659', rank: 'Ghost vanguards', joinDate: '23/11/2024 21:34' },
    { name: 'Sharai #5863', rank: 'Battleborn', joinDate: '06/01/2024 20:31' },
    { name: 'Shine #2788', rank: 'Iron sentinels', joinDate: '18/01/2024 16:27' },
    { name: 'Simo0000 #0000', rank: 'Surv-player-A', joinDate: '09/07/2025 21:55' },
    { name: 'Skolnever #2923', rank: 'Battleborn', joinDate: '06/07/2025 16:11' },
    { name: 'Slykizin #5458', rank: 'Whisper killers', joinDate: '08/09/2023 01:01' },
    { name: 'Smonakilo #3394', rank: 'volley-players-SS', joinDate: '08/07/2025 15:50' },
    { name: 'Soul_04 #7535', rank: 'volley-players-B', joinDate: '11/07/2025 17:22' },
    { name: 'Stephanie #2816', rank: 'Battleborn', joinDate: '08/08/2025 17:51' },
    { name: 'Strawberry #2813', rank: 'Surv-Player-B', joinDate: '19/06/2025 01:31' },
    { name: 'Sweet #2256', rank: 'Battleborn', joinDate: '04/08/2025 15:32' },
    { name: 'Tabi3a #0000', rank: 'Crimson fangs', joinDate: '21/10/2024 19:54' },
    { name: 'Tacteur #0000', rank: 'Whisper killers', joinDate: '01/07/2025 11:36' },
    { name: 'Taybokxx #0000', rank: 'Surv-Player-SS', joinDate: '30/03/2024 21:33' },
    { name: 'Teodoreczka #0000', rank: 'Battleborn', joinDate: '31/05/2025 11:56' },
    { name: 'Thalla #8295', rank: 'Battleborn', joinDate: '10/02/2024 13:11' },
    { name: 'Tom2678 #0151', rank: 'Crimson fangs', joinDate: '09/09/2024 12:50' },
    { name: 'Tramin #8174', rank: 'Battleborn', joinDate: '28/07/2025 13:07' },
    { name: 'Tripmehu #0000', rank: 'Battleborn', joinDate: '25/09/2023 17:10' },
    { name: 'Tuety #9375', rank: 'Battleborn', joinDate: '12/06/2025 22:47' },
    { name: 'Tukushiiii #0000', rank: 'Whisper killers', joinDate: '17/05/2025 14:45' },
    { name: 'Unicorn #1099', rank: 'Surv-player-A', joinDate: '17/07/2025 09:39' },
    { name: 'Wafferby #0000', rank: 'Battleborn', joinDate: '28/05/2025 00:03' },
    { name: 'Xioumi #0219', rank: 'Blade strategists', joinDate: '09/07/2024 01:02' },
    { name: 'Xova #3608', rank: 'Battleborn', joinDate: '30/04/2025 00:12' },
    { name: 'Xweroax #6445', rank: 'volley-players-B', joinDate: '08/07/2025 19:09' },
    { name: 'Xxgoooxx #7652', rank: 'Surv-Player-B', joinDate: '11/07/2025 19:54' },
    { name: 'Xxmareem #0000', rank: 'Surv-Player-S', joinDate: '25/07/2025 02:29' },
    { name: 'Yato #9246', rank: 'Battleborn', joinDate: '02/08/2025 15:11' },
    { name: 'Yhwach #2349', rank: 'Battleborn', joinDate: '10/07/2025 06:55' },
    { name: 'You9a #0000', rank: 'Surv-Player-B', joinDate: '28/01/2024 22:30' },
    { name: 'Younesskac #0000', rank: 'Surv-Player-B', joinDate: '05/06/2025 01:55' },
    { name: 'Youri #0623', rank: 'Apex hunters', joinDate: '21/12/2024 18:36' },
    { name: 'Yukii #7556', rank: 'Battleborn', joinDate: '11/07/2024 01:18' },
    { name: 'Yumichu #0219', rank: 'Battleborn', joinDate: '17/06/2025 01:21' },
    { name: 'Zamich #6353', rank: 'Battleborn', joinDate: '08/01/2024 06:27' },
    { name: 'Zanag3 #6464', rank: 'Battleborn', joinDate: '15/07/2025 15:50' }
  ];

  // Limit to the three specified members and deduplicate by name
  const allowedNames = new Set([
    'Ramasevosaff #0000',
    'Beautydoha #0000',
    'Bunny #9332',
  ]);
  const membersData = Array.from(
    new Map(
      rawMembersData
        .filter((m) => allowedNames.has(m.name))
        .map((m) => [m.name, m])
    ).values()
  );

  // Group members by rank
  const membersByRank = membersData.reduce((acc, member) => {
    if (!acc[member.rank]) {
      acc[member.rank] = [];
    }
    acc[member.rank].push(member);
    return acc;
  }, {} as Record<string, typeof membersData>);

  // Get rank color based on hierarchy
  const getRankColor = (rank: string) => {
    const index = rankHierarchy.indexOf(rank);
    if (index <= 1) return 'from-purple-500 to-pink-500'; // Alpha, Mythwalker
    if (index <= 4) return 'from-yellow-500 to-orange-500'; // VIP ranks
    if (index <= 7) return 'from-red-500 to-red-700'; // Elite ranks
    if (index <= 12) return 'from-blue-500 to-blue-700'; // Surv ranks
    if (index <= 17) return 'from-green-500 to-green-700'; // Volley ranks
    if (index <= 21) return 'from-gray-500 to-gray-700'; // Expert ranks
    return 'from-slate-500 to-slate-700'; // New member ranks
  };

  // Get rank icon
  const getRankIcon = (rank: string) => {
    if (rank === 'Alpha') return '👑';
    if (rank === 'Mythwalker') return '🌟';
    if (rank.includes('Elite') || rank.includes('Assassins')) return '⚔️';
    if (rank.includes('Ramen')) return '🍜';
    if (rank.includes('Apex') || rank.includes('hunters')) return '🏹';
    if (rank.includes('Crimson') || rank.includes('fangs')) return '🩸';
    if (rank.includes('Darkwatch')) return '🌙';
    if (rank.includes('Ghost') || rank.includes('vanguards')) return '👻';
    if (rank.includes('Surv')) return '🛡️';
    if (rank.includes('volley')) return '🏐';
    if (rank.includes('Iron') || rank.includes('sentinels')) return '⚡';
    if (rank.includes('Storm') || rank.includes('Fighters')) return '⛈️';
    if (rank.includes('Blade') || rank.includes('strategists')) return '🗡️';
    if (rank.includes('Whisper') || rank.includes('killers')) return '🔪';
    return '🥊';
  };

  const MemberCard = ({ member }: { member: any }) => {
    const normalized = member.name.replace(' #', '#');
    const [usernamePart, tagPart] = normalized.split('#');
    const username = usernamePart.trim();
    const discriminator = tagPart ? '#' + tagPart.trim() : '';
    const initials = username.substring(0, 2).toUpperCase();
    
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-sm font-bold text-white`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{username}</p>
            {discriminator && (
              <p className="text-xs text-gray-400">{discriminator}</p>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          <p className="mb-1">Joined: {member.joinDate}</p>
          <div className="flex items-center gap-1">
            <span>{getRankIcon(member.rank)}</span>
            <span className="truncate">{member.rank}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            The Freeborn Members
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet our community of {membersData.length} dedicated players across {Object.keys(membersByRank).length} different ranks. Each member has earned their place through skill, dedication, and teamwork.
          </p>
        </div>

        {/* Rank Statistics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-green-400">Rank Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {rankHierarchy.map((rank) => {
              const members = membersByRank[rank];
              if (!members || members.length === 0) return null;
              
              return (
                <div key={rank} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-700/50">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getRankColor(rank)} rounded-full mx-auto mb-2 flex items-center justify-center text-lg`}>
                    {getRankIcon(rank)}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1 truncate" title={rank}>{rank}</h3>
                  <p className="text-lg font-bold text-gray-300">{members.length}</p>
                  <p className="text-xs text-gray-500">member{members.length !== 1 ? 's' : ''}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Members by Rank */}
        {rankHierarchy.map((rank) => {
          const members = membersByRank[rank];
          if (!members || members.length === 0) return null;
          
          return (
            <section key={rank} className="mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className={`bg-gradient-to-r ${getRankColor(rank)} px-6 py-3 rounded-full flex items-center gap-3`}>
                  <span className="text-2xl">{getRankIcon(rank)}</span>
                  <h2 className="text-2xl font-bold text-white">{rank}</h2>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {members.map((member, index) => (
                  <MemberCard key={index} member={member} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Join CTA */}
        <section className="text-center py-12 border-t border-gray-700/50">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Become part of our growing community of {membersData.length} dedicated TFM players. Start your journey from Battleborn and work your way up through the ranks!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
              Apply to Join
            </button>
            <button className="border border-gray-600 hover:border-gray-500 px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-800/50">
              View Events
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Members;
