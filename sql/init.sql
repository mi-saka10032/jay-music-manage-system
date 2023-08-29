-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: jay_music_manage_system
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `album`
--

DROP TABLE IF EXISTS `album`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album` (
  `id` bigint NOT NULL,
  `updaterId` bigint NOT NULL,
  `createrId` bigint NOT NULL,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `albumName` varchar(100) NOT NULL,
  `publishTime` datetime DEFAULT NULL,
  `coverUrl` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_288fb30ad97d056ecb32683f0b` (`albumName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album`
--

LOCK TABLES `album` WRITE;
/*!40000 ALTER TABLE `album` DISABLE KEYS */;
INSERT INTO `album` VALUES (6935838229442560,6935834597752832,6935834597752832,'2023-08-29 22:38:00.246630','2023-08-29 22:38:08.000000','Mojito',NULL,'http://p1.music.126.net/d_yieD2xJu5VBydT-5U1ig==/109951167909350869.jpg'),(6935838229446656,6935834597752832,6935834597752832,'2023-08-29 22:38:00.248222','2023-08-29 22:38:09.000000','Jay','2000-11-07 00:00:00','http://p1.music.126.net/Gd-HAk9hKC85L0wNtfRs1g==/7946170535396804.jpg'),(6935838229454848,6935834597752832,6935834597752832,'2023-08-29 22:38:00.249087','2023-08-29 22:38:10.000000','叶惠美','2003-07-31 00:00:00','http://p2.music.126.net/ZGffiDQZrGj5s_hnR1CNbg==/109951165566379710.jpg'),(6935838229532672,6935834597752832,6935834597752832,'2023-08-29 22:38:00.264490','2023-08-29 22:38:01.000000','11月的萧邦','2005-11-01 00:00:00','http://p2.music.126.net/c6UWJU9iGaHGits7IqecRQ==/109951167749320136.jpg'),(6935838510194688,6935834597752832,6935834597752832,'2023-08-29 22:39:08.783649','2023-08-29 22:39:21.000000','七里香','2004-08-03 00:00:00','http://p2.music.126.net/P1goeQ7SoxEkFsb4ZDijMw==/7746059418324672.jpg'),(6935838971715584,6935834597752832,6935834597752832,'2023-08-29 22:41:01.463481','2023-08-29 22:41:03.000000','原神-啁哳流变之砂 The Unfathomable Sand Dunes',NULL,'http://p1.music.126.net/f9Hbu5v27bGmg5ALM8iN9Q==/109951168565989598.jpg'),(6935838971731968,6935834597752832,6935834597752832,'2023-08-29 22:41:01.466579','2023-08-29 22:41:02.000000','原神-智妙明论之林 Forest of Jnana and Vidya',NULL,'http://p1.music.126.net/mi40R92CSJ6zeroCvLxQQA==/109951167997564898.jpg'),(6935838971736064,6935834597752832,6935834597752832,'2023-08-29 22:41:01.467888','2023-08-29 22:41:01.000000','崩坏3-Elysium-Original Soundtrack',NULL,'http://p1.music.126.net/htzLixA-NYQ0Uj16KKQ45w==/109951167741983274.jpg'),(6935839099604992,6935834597752832,6935834597752832,'2023-08-29 22:41:32.679963','2023-08-29 22:41:32.000000','崩坏星穹铁道-长生梦短 Svah Sanishyu',NULL,'http://p2.music.126.net/oDhurcFOPMPVMLnc6xF99A==/109951168765200998.jpg');
/*!40000 ALTER TABLE `album` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `singer`
--

DROP TABLE IF EXISTS `singer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `singer` (
  `id` bigint NOT NULL,
  `updaterId` bigint NOT NULL,
  `createrId` bigint NOT NULL,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `singerName` varchar(100) NOT NULL,
  `coverUrl` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_007cdb806a47c3a33362fb7d80` (`singerName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `singer`
--

LOCK TABLES `singer` WRITE;
/*!40000 ALTER TABLE `singer` DISABLE KEYS */;
INSERT INTO `singer` VALUES (6935838229622784,6935834597752832,6935834597752832,'2023-08-29 22:38:00.283126','2023-08-29 22:39:21.000000','周杰伦','http://p2.music.126.net/Esjm32Q05PQoX8pF008u7w==/109951165793871057.jpg'),(6935838971879424,6935834597752832,6935834597752832,'2023-08-29 22:41:01.497473','2023-08-29 22:41:32.000000','HOYO-MiX','http://p2.music.126.net/Y2_BNSAyXLMHztZWCfUKKA==/109951168127138041.jpg');
/*!40000 ALTER TABLE `singer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `singer_songs_song`
--

DROP TABLE IF EXISTS `singer_songs_song`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `singer_songs_song` (
  `singerId` bigint NOT NULL,
  `songId` bigint NOT NULL,
  PRIMARY KEY (`singerId`,`songId`),
  KEY `IDX_2a29c9c084e39d61edd076322f` (`singerId`),
  KEY `IDX_0f56c558496f7d2244a8c99758` (`songId`),
  CONSTRAINT `FK_0f56c558496f7d2244a8c99758b` FOREIGN KEY (`songId`) REFERENCES `song` (`id`),
  CONSTRAINT `FK_2a29c9c084e39d61edd076322f2` FOREIGN KEY (`singerId`) REFERENCES `singer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `singer_songs_song`
--

LOCK TABLES `singer_songs_song` WRITE;
/*!40000 ALTER TABLE `singer_songs_song` DISABLE KEYS */;
INSERT INTO `singer_songs_song` VALUES (6935838229622784,6935838229237760),(6935838229622784,6935838229237761),(6935838229622784,6935838229241856),(6935838229622784,6935838229241857),(6935838229622784,6935838510153728),(6935838229622784,6935838563192832),(6935838971879424,6935838971592704),(6935838971879424,6935838971592705),(6935838971879424,6935838971592707),(6935838971879424,6935839099572224);
/*!40000 ALTER TABLE `singer_songs_song` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `song`
--

DROP TABLE IF EXISTS `song`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `song` (
  `id` bigint NOT NULL,
  `updaterId` bigint NOT NULL,
  `createrId` bigint NOT NULL,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `songName` varchar(100) NOT NULL,
  `duration` int NOT NULL,
  `lyric` text,
  `musicUrl` varchar(100) NOT NULL,
  `publishTime` datetime DEFAULT NULL,
  `albumId` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_c529927ae410af49faaf2e239a5` (`albumId`),
  CONSTRAINT `FK_c529927ae410af49faaf2e239a5` FOREIGN KEY (`albumId`) REFERENCES `album` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `song`
--

LOCK TABLES `song` WRITE;
/*!40000 ALTER TABLE `song` DISABLE KEYS */;
INSERT INTO `song` VALUES (6935838229237760,6935834597752832,6935834597752832,'2023-08-29 22:38:00.209580','2023-08-29 22:38:00.000000','Mojito',185,'[00:00.000] 作词 : 黄俊郎\n[00:01.000] 作曲 : 周杰伦\n[00:02.000] 编曲 : 黄雨勋\n[00:16.599]麻烦给我的爱人来一杯Mojito\n[00:20.791]我喜欢阅读她微醺时的眼眸\n[00:24.987]而我的咖啡糖不用太多\n[00:29.156]这世界已经因为她甜得过头\n[00:33.318]没有跟她笑容一样浓郁的雪茄\n[00:37.455]就别浪费时间介绍收起来吧\n[00:41.604]拱廊的壁画旧城的涂鸦\n[00:45.792]所有色彩都因为她说不出话\n[00:49.919]这爱不落幕忘了心事的国度\n[00:54.159]你所在之处孤单都被征服\n[00:58.323]铁铸的招牌错落着就像\n[01:02.472]一封封城市献给天空的情书\n[01:06.672]当街灯亮起Havana漫步\n[01:10.826]这是世上最美丽的那双人舞\n[01:14.824]\n[01:32.304]缤纷的老爷车跟着棕榈摇曳\n[01:34.442]载着海风私奔漫无目的\n[01:36.543]古董书摊漫着时光香气\n[01:38.512]我想上辈子是不是就遇过你\n[01:40.976]喧嚣的海报躺在慵懒的阁楼阳台\n[01:45.250]而你是文学家笔下的那一片海\n[01:48.332]麻烦给我的爱人来一杯Mojito\n[01:52.558]我喜欢阅读她微醺时的眼眸\n[01:56.704]而我的咖啡糖不用太多\n[02:00.891]这世界已经因为她甜得过头\n[02:05.034]这爱不落幕忘了心事的国度\n[02:09.251]你所在之处孤单都被征服\n[02:13.402]铁铸的招牌错落着就像\n[02:17.584]一封封城市献给天空的情书\n[02:21.738]当街灯亮起Havana漫步\n[02:25.961]这是世上最美丽的那双人舞\n[02:38.548]铁铸的招牌错落着就像\n[02:42.615]一封封城市献给天空的情书\n[02:46.815]当街灯亮起Havana漫步\n[02:51.003]这是世上最美丽的那双人舞\n[03:02.003]制作人: 周杰伦\n[03:03.003]OP: JVRMusic Int\'l Ltd.\n[03:04.003]SP: Universal Music Publishing Ltd.\n[03:05.003]TWK972001101\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838122082304.mp3',NULL,6935838229442560),(6935838229237761,6935834597752832,6935834597752832,'2023-08-29 22:38:00.213321','2023-08-29 22:38:00.000000','反方向的钟',258,'[00:00.00] 作词 : 方文山\n[00:01.00] 作曲 : 周杰伦\n[00:02.00] 编曲 : 周杰伦\n[00:03.00] 制作人 : 周杰伦\n[00:07.25]\n[00:45.57]迷迷蒙蒙 你给的梦\n[00:47.97]出现裂缝 隐隐作痛\n[00:50.35]怎么沟通 你都没空\n[00:52.80]说我不懂 说了没用\n[00:55.50]他的笑容 有何不同\n[00:57.85]在你心中 我不再受宠\n[01:00.68]我的天空 是雨是风\n[01:03.00]还是彩虹 你在操纵\n[01:05.30]\n[01:06.51]恨自己真的没用\n[01:08.59]情绪激动\n[01:11.12]一颗心到现在还在抽痛\n[01:15.00]还为分手前那句抱歉\n[01:20.28]在感动\n[01:21.62]\n[01:26.22]穿梭时间的画面的钟\n[01:30.97]从反方向开始移动\n[01:36.17]回到当初爱你的时空\n[01:41.01]停格内容不忠\n[01:44.22]\n[01:46.52]所有回忆对着我进攻\n[01:51.26]我的伤口被你拆封\n[01:56.40]誓言太沉重泪被纵容\n[02:01.28]脸上汹涌失控\n[02:04.40]\n[02:16.57]城市霓虹 不安跳动\n[02:18.35]染红夜空\n[02:19.22]过去种种 像一场梦\n[02:20.68]不敢去碰 一想就痛\n[02:21.82]心碎内容 每一秒钟\n[02:23.07]都有不同 你不懂\n[02:24.16]连一句珍重 也有苦衷\n[02:25.74]也不想送\n[02:26.51]寒风中 废墟烟囱\n[02:27.81]停止转动 一切落空\n[02:29.07]在人海中 盲目跟从\n[02:30.57]别人的梦 全面放纵\n[02:31.87]恨没有用 疗伤止痛\n[02:33.29]不再感动 没有梦\n[02:34.50]痛不知轻重 泪水鲜红\n[02:36.03]全面放纵\n[02:37.07]\n[02:47.75]恨自己真的没用 情绪激动\n[02:52.28]一颗心到现在还在抽痛\n[02:57.41]还为分手前那句抱歉\n[03:01.38]在感动\n[03:02.96]\n[03:07.66]穿梭时间的画面的钟\n[03:12.22]从反方向开始移动\n[03:17.59]回到当初爱你的时空\n[03:22.44]停格内容不忠\n[03:25.59]\n[03:27.83]所有回忆对着我进攻\n[03:32.63]我的伤口被你拆封\n[03:37.97]誓言太沉重泪被纵容\n[03:42.81]脸上汹涌失控\n[03:46.00]\n[03:48.37]穿梭时间的画面的钟\n[03:52.85]从反方向开始移动\n[03:58.10]回到当初爱你的时空\n[04:03.03]停格内容不忠\n[04:10.549]Guitar：倪方来\n[04:10.765]合声编写：周杰伦\n[04:10.938]合声：周杰伦\n[04:11.088]过带录音师：Gary Yang (J&A 录音室)\n[04:11.241]配唱录音师：Gary Yang (J&A 录音室)\n[04:11.369]混音录音师：杨大纬 (J&A 录音室)\n[04:11.522]OP：ALFA MUSIC PRODUCTION 100%\n[04:11.805]ISRC-TW-C23-00-001-10\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838123474944.mp3','2000-11-07 00:00:00',6935838229446656),(6935838229241856,6935834597752832,6935834597752832,'2023-08-29 22:38:00.215980','2023-08-29 22:38:01.000000','以父之名',342,'[00:00.000] 作词 : 黄俊郎\n[00:00.544] 作曲 : 周杰伦\n[00:01.088] 编曲 : 洪敬尧\n[00:01.632] 制作人 : 周杰伦\n[00:02.179]Ave Maria grazia ricevuta per la mia famiglia\n[00:15.030]Con risentito con un\'amorevole divino amen\n[00:30.059]Grazie chiedo a te o signore divino\n[00:34.599]In questo giorno di grazia prego per te\n[00:38.505]Ave Maria piena di grazia\n[00:40.824]Il signore e con te\n[00:42.362]Sia fatta la tua volonta\n[00:44.117]Così in cielo e così in terra neil nome\n[00:46.978]Del padre del figliolo e dello spirito santo amen\n[00:50.411]\n[01:27.166]微凉的晨露 沾湿黑礼服\n[01:29.932]石板路有雾 父在低诉\n[01:32.707]无奈的觉悟 只能更残酷\n[01:35.580]一切都为了通往圣堂的路\n[01:38.145]吹不散的雾 隐没了意图\n[01:40.856]谁轻柔踱步 停住\n[01:43.216]还来不及哭\n[01:44.292]穿过的子弹就带走温度\n[01:47.384]\n[01:48.741]我们每个人都有罪\n[01:50.454]犯着不同的罪\n[01:51.845]我能决定谁对\n[01:53.231]谁又该要沉睡\n[01:54.572]争论不能解决\n[01:55.920]在永无止境的夜\n[01:57.301]关掉你的嘴\n[01:58.667]唯一的恩惠\n[01:59.685]挡在前面的人都有罪\n[02:01.387]后悔也无路可退\n[02:02.747]以父之名判决\n[02:04.020]那感觉没有适合字汇\n[02:05.710]就像边笑边掉泪\n[02:07.031]凝视着完全的黑\n[02:08.398]阻挡悲剧蔓延的悲剧会让我沉醉\n[02:10.846]低头亲吻我的左手\n[02:12.206]换取被宽恕的承诺\n[02:13.595]老旧管风琴在角落\n[02:14.935]一直一直一直伴奏\n[02:16.283]黑色帘幕被风吹动\n[02:17.806]阳光无言地穿透\n[02:19.237]洒向那群被我驯服后的兽\n[02:21.957]沉默地喊叫 沉默地喊叫\n[02:23.312]孤单开始发酵\n[02:24.738]不停对着我嘲笑\n[02:26.122]回忆逐渐延烧\n[02:27.445]曾经纯真的画面\n[02:28.859]残忍的温柔出现\n[02:30.184]脆弱时间到\n[02:31.234]我们一起来祷告\n[02:32.927]仁慈的父我已坠入\n[02:36.028]看不见罪的国度\n[02:38.761]请原谅我的自负\n[02:41.171]Ah ya ya check it check it ah ya\n[02:43.903]没人能说没人可说\n[02:46.955]好难承受\n[02:48.721]荣耀的背后刻着一道孤独\n[02:52.135]Ah ya ya check it check it ah ya\n[02:54.860]闭上双眼我又看见\n[02:57.949]当年那梦的画面\n[03:00.691]天空是蒙蒙的雾\n[03:03.086]Ah ya ya check it check it ah ya\n[03:05.832]父亲牵着我的双手\n[03:08.861]轻轻走过\n[03:10.605]清晨那安安静静的石板路\n[03:14.012]Ah ya ya check it check it ah ya\n[03:16.790]\n[03:22.618]Pie Jesu\n[03:28.280]Qui tollis peccata\n[03:33.174]Dona eis requiem\n[03:45.873]\n[03:46.614]低头亲吻我的左手\n[03:47.920]换取被宽恕的承诺\n[03:49.281]老旧管风琴在角落\n[03:50.649]一直一直一直伴奏\n[03:52.005]黑色帘幕被风吹动\n[03:53.500]阳光无言地穿透\n[03:54.910]洒向那群被我驯服后的兽\n[03:57.687]沉默地喊叫 沉默地喊叫\n[03:59.028]孤单开始发酵\n[04:00.376]不停对着我嘲笑\n[04:01.775]回忆逐渐延烧\n[04:03.121]曾经纯真的画面\n[04:04.512]残忍地温柔出现\n[04:05.826]脆弱时间到\n[04:06.848]我们一起来祷告\n[04:08.622]仁慈的父我已坠入\n[04:11.708]看不见罪的国度\n[04:14.460]请原谅我的自负\n[04:16.846]Ah ya ya check it check it ah ya\n[04:19.626]没人能说没人可说\n[04:22.661]好难承受\n[04:24.429]荣耀的背后刻着一道孤独\n[04:27.828]Ah ya ya check it check it ah ya\n[04:30.886]仁慈的父 我已坠入\n[04:36.351]看不见罪的国度\n[04:41.785]请原谅我 我的自负\n[04:47.252]刻着一道孤独\n[04:51.771]\n[04:52.433]仁慈的父我已坠入\n[04:55.477]看不见罪的国度\n[04:58.206]请原谅我的自负\n[05:00.626]Ah ya ya check it check it ah ya\n[05:03.375]没人能说没人可说\n[05:06.439]好难承受\n[05:08.203]荣耀的背后刻着一道孤独\n[05:11.588]Ah ya ya check it check it ah ya\n[05:14.329]斑驳的家徽 擦拭了一夜\n[05:17.084]孤独的光辉 才懂的感觉\n[05:20.119]烛光 不 不 停的摇晃\n[05:22.538]猫头鹰在窗棂上\n[05:23.855]对着远方眺望\n[05:25.594]通向大厅的长廊\n[05:28.322]一样 说不出的沧桑\n[05:31.067]没有喧嚣 只有宁静围绕\n[05:33.552]我 慢慢睡着\n[05:34.892]天 刚刚破晓\n[05:35.907] 和声编写 : 周杰伦\n[05:36.922] 合声 : 周杰伦\n[05:37.937] 录音工程 : 杨瑞代\n[05:38.952] 混音 : 杨大纬（杨大纬录音工作室）\n[05:39.967] 录音助理 : 刘勇志\n[05:40.982] 声乐 : 戴旖旎\n[05:41.997] Scratch : 郭正男/江尚谕\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838123548672.mp3','2003-07-31 00:00:00',6935838229454848),(6935838229241857,6935834597752832,6935834597752832,'2023-08-29 22:38:00.242566','2023-08-29 22:38:01.000000','一路向北',296,'[00:00.000] 作词 : 方文山\n[00:00.750] 作曲 : 周杰伦\n[00:01.500] 编曲 : 蔡科俊\n[00:02.250] 制作人 : 周杰伦\n[00:03.000]\n[00:36.993]后视镜里的世界\n[00:41.414]\n[00:44.165]越来越远的道别\n[00:48.675]你转身向背\n[00:51.809]侧脸还是很美\n[00:55.371]我用眼光去追\n[00:58.951]竟听见你的泪\n[01:03.229]\n[01:05.639]在车窗外面徘徊\n[01:10.080]\n[01:12.816]是我错失的机会\n[01:17.293]你站的方位\n[01:19.993]跟我中间隔着泪\n[01:23.547]街景一直在后退\n[01:27.171]你的崩溃在窗外零碎\n[01:31.617]我一路向北\n[01:34.301]离开有你的季节\n[01:38.801]你说你好累\n[01:41.472]已无法再爱上谁\n[01:45.956]风在山路吹\n[01:48.628]过往的画面全都是我不对\n[01:54.012]细数惭愧 我伤你几回\n[01:59.887]\n[02:20.935]后视镜里的世界\n[02:25.405]\n[02:28.053]越来越远的道别\n[02:32.564]你转身向背\n[02:35.685]侧脸还是很美\n[02:39.254]我用眼光去追\n[02:42.859]竟听见你的泪\n[02:47.151]\n[02:49.545]在车窗外面徘徊\n[02:53.900]\n[02:56.706]是我错失的机会\n[03:01.149]你站的方位\n[03:03.864]跟我中间隔着泪\n[03:07.385]街景一直在后退\n[03:11.001]你的崩溃在窗外零碎\n[03:15.480]我一路向北\n[03:18.200]离开有你的季节\n[03:22.654]你说你好累\n[03:25.318]已无法再爱上谁\n[03:29.811]风在山路吹\n[03:32.494]过往的画面全都是我不对\n[03:37.875]细数惭愧 我伤你几回\n[03:44.086]我一路向北\n[03:46.823]离开有你的季节\n[03:51.225]方向盘周围\n[03:53.947]回转着我的后悔\n[03:58.479]我加速超越\n[04:01.164]却甩不掉紧紧跟随的伤悲\n[04:06.531]细数惭愧 我伤你几回\n[04:13.726]停止狼狈 就让错纯粹\n[04:25.340]\n[04:27.000]制作人：周杰伦\n[04:30.000]合声编写：周杰伦\n[04:33.000]合声：周杰伦\n[04:36.000]吉他：蔡科俊Again\n[04:39.000]贝斯：陈任佑\n[04:42.000]鼓：陈伯州\n[04:45.000]录音工程：戴健宇(杨大纬录音工作)\n[04:48.000]混音工程：杨大纬(杨大纬录音工作室)\n[04:51.000]OP：Alfa Music Publishing Co., Ltd.\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838123589632.mp3','2005-11-01 00:00:00',6935838229532672),(6935838510153728,6935834597752832,6935834597752832,'2023-08-29 22:39:08.773165','2023-08-29 22:39:08.000000','园游会',256,'[00:00.00] 作词 : 方文山\n[00:01.00] 作曲 : 周杰伦\n[00:02.00] 编曲 : 洪敬尧\n[00:03.00] 制作人 : 周杰伦\n[00:04.00]和声：周杰伦\n[00:05.00]和声编写：周杰伦\n[00:06.00]录音：Gary(Alfa Studio)\n[00:07.00]混音工程：杨大纬(杨大纬录音工作室)\n[00:32.35]琥珀色黄昏像糖在很美的远方\n[00:36.42]你的脸没有化妆我却疯狂爱上\n[00:40.33]思念跟影子在傍晚一起被拉长\n[00:44.24]我手中那张入场券陪我数羊\n[00:48.05]薄荷色草地芬芳像风没有形状\n[00:52.11]我却能够牢记你的气质跟脸庞\n[00:55.97]冷空气跟琉璃在清晨很有透明感\n[00:59.98]像我的喜欢 被你看穿\n[01:03.48]摊位上一朵艳阳\n[01:06.48]我悄悄出现你身旁\n[01:11.20]你慌乱的模样\n[01:13.13]我微笑安静欣赏\n[01:18.06]我顶着大太阳\n[01:20.14]只想为你撑伞\n[01:22.12]你靠在我肩膀\n[01:24.00]深呼吸怕遗忘\n[01:26.03]因为捞鱼的蠢游戏我们开始交谈\n[01:29.94]多希望话题不断园游会永不打烊\n[01:33.85]气球在我手上\n[01:35.88]我牵着你瞎逛\n[01:37.81]有话想对你讲\n[01:39.74]你眼睛却装忙\n[01:41.73]鸡蛋糕跟你嘴角果酱我都想要尝\n[01:45.68]园游会影片在播放\n[01:47.92]这个世界约好一起逛\n[02:06.88]琥珀色黄昏像糖在很美的远方\n[02:10.84]你的脸没有化妆我却疯狂爱上\n[02:14.75]思念跟影子在傍晚一起被拉长\n[02:18.67]我手中那张入场券陪我数羊\n[02:22.58]薄荷色草地芬芳像风没有形状\n[02:26.54]我却能够牢记你的气质跟脸庞\n[02:30.45]冷空气跟琉璃在清晨很有透明感\n[02:34.36]像我的喜欢 被你看穿\n[02:37.98]摊位上一朵艳阳\n[02:40.98]我悄悄出现你身旁\n[02:45.60]你慌乱的模样\n[02:47.58]我微笑安静欣赏\n[02:52.56]我顶着大太阳\n[02:54.54]只想为你撑伞\n[02:56.52]你靠在我肩膀\n[02:58.45]深呼吸怕遗忘\n[03:00.38]因为捞鱼的蠢游戏我们开始交谈\n[03:04.34]多希望话题不断园游会永不打烊\n[03:08.25]气球在我手上\n[03:10.24]我牵着你瞎逛\n[03:12.22]有话想对你讲\n[03:14.15]你眼睛却装忙\n[03:16.18]鸡蛋糕跟你嘴角果酱我都想要尝\n[03:20.14]园游会影片在播放\n[03:22.33]这个世界约好一起逛\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838483779584.mp3','2004-08-03 00:00:00',6935838510194688),(6935838563192832,6935834597752832,6935834597752832,'2023-08-29 22:39:21.723352','2023-08-29 22:39:21.000000','七里香',296,'[00:00.000] 作词 : 方文山\n[00:01.000] 作曲 : 周杰伦\n[00:02.000] 编曲 : 钟兴民\n[00:03.000] 制作人 : 周杰伦\n[00:04.000] 和声编写 : 周杰伦\n[00:05.000] 合声 : 周杰伦\n[00:06.000] 吉他 : 黄中岳\n[00:07.000] 鼓 : 陈伯州\n[00:08.000] 弦乐录音师 : 林哲民（北京OASIS）\n[00:09.000] 弦乐录音室 : 北京OASIS\n[00:10.000] 弦乐 : 北京爱乐\n[00:11.000] 录音工程 : 杨大纬（ALFA STUDIO）\n[00:12.000] 混音 : 杨大纬（杨大纬录音工作室）\n[00:13.000] OP : ALFA MUSIC PUBLISHING CO./LTD\n[00:27.702]窗外的麻雀 在电线杆上多嘴\n[00:34.490]你说这一句 很有夏天的感觉\n[00:41.190]手中的铅笔 在纸上来来回回\n[00:47.582]我用几行字形容你是我的谁\n[00:54.329]秋刀鱼的滋味 猫跟你都想了解\n[01:01.447]初恋的香味就这样被我们寻回\n[01:07.811]那温暖的阳光 像刚摘的鲜艳草莓\n[01:14.138]你说你舍不得吃掉这一种感觉\n[01:20.907]雨下整夜 我的爱溢出就像雨水\n[01:27.608]院子落叶 跟我的思念厚厚一叠\n[01:34.345]几句是非 也无法将我的热情冷却\n[01:41.945]你出现在我诗的每一页\n[01:47.900]雨下整夜 我的爱溢出就像雨水\n[01:54.623]窗台蝴蝶 像诗里纷飞的美丽章节\n[02:01.359]我接着写 把永远爱你写进诗的结尾\n[02:08.972]你是我唯一想要的了解\n[02:15.235]\n[02:41.846]雨下整夜 我的爱溢出就像雨水\n[02:48.581]院子落叶 跟我的思念厚厚一叠\n[02:55.327]几句是非 也无法将我的热情冷却\n[03:02.943]你出现在我诗的每一页\n[03:09.320]那饱满的稻穗 幸福了这个季节\n[03:16.440]而你的脸颊像田里熟透的番茄\n[03:22.801]你突然对我说 七里香的名字很美\n[03:29.149]我此刻却只想亲吻你倔强的嘴\n[03:35.869]雨下整夜 我的爱溢出就像雨水\n[03:42.576]院子落叶 跟我的思念厚厚一叠\n[03:49.355]几句是非 也无法将我的热情冷却\n[03:56.911]你出现在我诗的每一页\n[04:03.304]整夜 我的爱溢出就像雨水\n[04:09.595]窗台蝴蝶 像诗里纷飞的美丽章节\n[04:16.351]我接着写 把永远爱你写进诗的结尾\n[04:23.936]你是我唯一想要的了解\n[04:30.377]\n[04:39.000]弦乐助理：杨波（北京）\n[04:42.000]1st Violin：陈允、曾诚、王洋、后则周、张晗、高奕丽、贾梅\n[04:43.000]2nd Violin：李博彦、严柯、史丹、后昆年、刘玉琪、简蓓\n[04:44.000]Violas：毛新光、张安详、曹飞、李明\n[04:45.000]Cellos：黄远泽、关大伟、郭筱姮、刘宇冬\n[04:46.000]C.Bass：劭士坆、张小迪\n[04:50.000]ISRC: TW-C23-04-007-02\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838538579968.mp3','2004-08-03 00:00:00',6935838510194688),(6935838971592704,6935834597752832,6935834597752832,'2023-08-29 22:41:01.432163','2023-08-29 22:41:01.000000','Her Wishes 她的期许',148,'作曲 : 陈致逸 Yu-Peng Chen (HOYO-MiX)\n\n编曲 Arranger：陈致逸 Yu-Peng Chen (HOYO-MiX)\n乐队 Orchestra：Budapest Scoring Orchestra / 国际首席爱乐乐团 International Master Philharmonic Orchestra\n演唱 Voice：朱梓溶 Zirong Zhu\n录音棚 Recording Studio：Budapest Scoring / 九紫天诚录音棚 SKY FIRE STUDIO / 52Hz Studio\n录音师 Recording Engineer：Dénes Rédly / 刘婉秋 Wanqiu Liu / 黄巍 Zach Huang\n音频编辑 Editing Engineer：徐威 Aaron Xu\n混音师 Mixing Engineer：黄巍 Zach Huang\n母带制作 Mastering Engineer：Simon Li\n出品 Produced by：HOYO-MiX\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838859563008.mp3',NULL,NULL),(6935838971592705,6935834597752832,6935834597752832,'2023-08-29 22:41:01.432861','2023-08-29 22:41:03.000000','Maidens of Sanctity 花与树的女儿们',116,'作曲 : 姜以君 Yijun Jiang (HOYO-MiX)\n\n编曲 Arranger：姜以君 Yijun Jiang (HOYO-MiX)\n演唱 Voice：车子玉 Ziyu Che (HOYO-MiX)\n混音师 Mixing Engineer：黄巍 Zach Huang\n母带制作 Mastering Engineer：黄巍 Zach Huang\n出品 Produced by：HOYO-MiX\n\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838860668928.mp3',NULL,NULL),(6935838971592706,6935834597752832,6935834597752832,'2023-08-29 22:41:01.434604','2023-08-29 22:41:01.000000','Elysian Realm',110,'[00:00.00] 作曲 : 李敬浩Hao(HOYO-MiX)\n[99:00.00]纯音乐，请欣赏\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838859456512.mp3',NULL,6935838971736064),(6935838971592707,6935834597752832,6935834597752832,'2023-08-29 22:41:01.435732','2023-08-29 22:41:03.000000','Polumnia Omnia 三千娑世御咏歌',201,'[00:00.00] 作词 : 项柳 Hsiang Liu\n[00:00.51] 作曲 : 陈致逸 Yu-Peng Chen (HOYO-MiX)\n[00:01.02] 管弦配器 Orchestrator：陈致逸 Yu-Peng Chen (HOYO-MiX)\n[00:01.54] 编曲（电子） Arranger：姜以君 Yijun Jiang (HOYO-MiX)\n[00:02.05] 乐队 Orchestra：Budapest Scoring Orchestra / Art of Loong Orchestra 龙之艺交响乐团\n[00:02.57] 演唱 Voice：陈致逸 Yu-Peng Chen (HOYO-MiX)\n[00:03.08] 尺八 Shakuhachi：顾剑楠 Jiannan Gu\n[00:03.59] 男高音合唱 Tenor Choir：徐小明 Xiaoming Xu / 李新宇 Xinyu Li / 胡笳 Jia Hu / 吴波涛 Botao Wu / 伍洲 Zhou Wu / 戴月 Yue Dai / 韩潇 Xiao Han / 董正妍 Zhengyan Dong\n[00:04.11] 录音棚 Recording Studio：Budapest Scoring / 上海音像公司录音棚 YX STUDIO / YX STUDIO / 52Hz Studio\n[00:04.62] 录音师 Recording Engineer：Dénes Rédly / 莫家伟 Jiawei Mo / 黄巍 Zach Huang\n[00:05.14] 音频编辑 Editing Engineer：徐威 Aaron Xu\n[00:05.65] 混音师 Mixing Engineer：黄巍 Zach Huang\n[00:06.16] 母带制作 Mastering Engineer：黄巍 Zach Huang\n[00:06.68] 出品 Produced by：HOYO-MiX\n[00:07.20]\n[00:07.39]Vosmet vetat res coelica\n[00:19.50]\n[00:25.43]Iam premet letum vastum te\n[00:37.41]Vae gnari sunt suimet quis in oculis (Vae gnari estis vestris quis in oculis)\n[00:49.41]\n[01:01.41]ごやのすゑなぞながされ\n[01:11.16]\n[01:11.92]Sapientes feroces vetitum per currunt nefas (Sapientes pelliciuntur in nefas)\n[01:19.02]tarda leti et necessitas semota corripiet gradum (tarda leti mors necessitudinis corripiet gradum)\n[01:28.52]\n[01:29.89]Iugis solum ipsius nihil debet\n[01:40.45]\n[01:46.42]Credas in nullum qua sunt edicta inutile (Cave vide qua sunt edicta inutile)\n[02:04.45]\n[02:10.42]Dominatus\n[02:13.42]Dominatus\n[02:14.92]Dominatus\n[02:16.45]\n[02:28.45]ごやのすゑなぞながされ\n[02:38.14]\n[02:38.89]Vae eis simulacrum in solio inanis fixere sapientes (Vae eis cui simulacrum conlaudent mirent augeant)\n[02:49.45]necessitas semota corripiet gradum (et necessitudinis corripiet gradum)\n[02:55.45]\n[02:56.95]Nunquam genitus desiderem\n[03:07.48]\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838860836864.mp3',NULL,6935838971715584),(6935838971592708,6935834597752832,6935834597752832,'2023-08-29 22:41:01.436578','2023-08-29 22:41:02.000000','For Riddles, for Wonders 几初的智愿',134,'作曲 : 陈致逸 Yu-Peng Chen (HOYO-MiX)\n\n编曲 Arranger：陈致逸 Yu-Peng Chen (HOYO-MiX)\n指挥 Conductor：Robert Ziegler\n乐队 Orchestra：伦敦交响乐团 London Symphony Orchestra\n班苏里笛 Bansuri：Eliza Marshall\n西塔尔琴 Sitar：Arjun Verma\n民乐监制 Folk Instruments Supervisor：Kuljit Bhamra\n录音棚 Recording Studio：St Luke\'s/Redfort Studio\n录音师 Recording Engineer：Lewis Jones/Kuljit Bhamra\n音频编辑 Editing Engineer：George Oulton/Freddie Light\n混音师 Mixing Engineer：Lewis Jones\n母带制作 Mastering Engineer：Simon Gibson\n出品 Produced by：HOYO-MiX\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935838859608064.mp3',NULL,6935838971731968),(6935839099572224,6935834597752832,6935834597752832,'2023-08-29 22:41:32.671937','2023-08-29 22:41:32.000000','水龙吟 Samudrartha',172,'[00:00.000] 作词 : 邪叫教主\n[00:00.718] 作曲 : 林一凡Fan (HOYO-MiX)\n[00:01.436] 编曲 : 文驰Vinchi (HOYO-MiX)\n[00:02.154] 制作人 : 林一凡Fan (HOYO-MiX)\n[00:02.872]\n[00:03.134]过往 潮汐\n[00:11.673]将我的伤痕 刻蚀成龙鳞\n[00:17.519]吐息中酝酿着风云\n[00:22.566]血脉 根须\n[00:32.132]在我皮肉下 交织成命运\n[00:37.729]扎根于烈火烧灼的龙心\n[00:43.318]磨砺 金石 做我的骨骼\n[00:47.836]放任 飓风 从喉中挣脱\n[00:52.903]用传说重塑我\n[00:57.941]用疼痛重铸我\n[01:02.457]\n[01:03.526]撕裂形骸解放\n[01:09.629]万钧雷霆的巨响\n[01:13.620]摇撼心魂激荡\n[01:20.277]惊涛骇浪\n[01:23.742]胸口鲜血滚烫\n[01:30.119]淬炼出爪牙锋芒\n[01:33.841]我必身披星光\n[01:40.227]再临于重渊之上\n[01:46.599]\n[02:06.833]撕裂形骸解放\n[02:12.963]万钧雷霆的巨响\n[02:16.414]摇撼心魂激荡\n[02:23.317]惊涛骇浪\n[02:27.048]胸口鲜血滚烫\n[02:33.147]淬炼出爪牙锋芒\n[02:37.130]我必身披星光\n[02:43.240]再临于重渊之上\n[02:47.489]\n[02:47.990] 歌手 Vocal Artist：优素\n[02:48.491] 乐队 Orchestra：龙之艺交响乐团 Art of Loong Orchestra\n[02:48.992] 古琴 Guqin：方静宇 Jingyu Fang\n[02:49.493] 和声 Back Vocal：优素 / 王可鑫 Eli.W (HOYO-MiX)\n[02:49.994] 录音棚 Recording Studio：奕和录音棚 YiHe Studio / 升赫录音棚Soundhub Studio / 上海广播大厦 Shanghai Media Group\n[02:50.495] 录音师 Recording Engineer：刘思宇 Red Liu / 焦磊@Soundhub Studios / 莫家伟 Jiawei Mo\n[02:50.996] 混音师 Mixing Engineer：宫奇Gon (HOYO-MiX)\n[02:51.497] 母带制作 Mastering Engineer：宫奇Gon (HOYO-MiX)\n[02:51.998] 出品 Produced by：HOYO-MiX\n','http://misaka10032.oss-cn-chengdu.aliyuncs.com/music/6935839086002176.mp3',NULL,6935839099604992);
/*!40000 ALTER TABLE `song` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL,
  `updaterId` bigint NOT NULL,
  `createrId` bigint NOT NULL,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `avatarUrl` varchar(100) DEFAULT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(200) NOT NULL,
  `regTime` datetime NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (6935834597752832,1,1,'2023-08-29 22:23:13.612963','2023-08-29 22:23:13.612963',NULL,'misaka10032','{bcrypt}$2a$05$6Wx0PTC2/EXUKZG9oVmHG.l48vBL.x3HDDPXLGBxULyLhMh4V2j/O','2023-08-29 22:23:14',1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-08-29 22:44:59
