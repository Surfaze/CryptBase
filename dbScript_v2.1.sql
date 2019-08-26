-- MySQL dump 10.13  Distrib 5.7.25, for Linux (x86_64)
--
-- Host: localhost    Database: FYPV2
-- ------------------------------------------------------
-- Server version	5.7.25-0ubuntu0.16.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chat`
--
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'toor';
FLUSH PRIVILEGES;

DROP DATABASE IF EXISTS `FYPV2`;
CREATE DATABASE `FYPV2`;
USE `FYPV2`;


DROP TABLE IF EXISTS `chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat` (
  `userid` int(11) NOT NULL,
  `chattime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `content` varchar(255) NOT NULL,
  PRIMARY KEY (`userid`,`chattime`),
  CONSTRAINT `chat_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `user` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat`
--

LOCK TABLES `chat` WRITE;
/*!40000 ALTER TABLE `chat` DISABLE KEYS */;
INSERT INTO `chat` VALUES (1001,'2019-07-21 04:47:28','When do we start on Topic CT001?'),(5001,'2019-07-21 04:47:28','Whenever you are ready');
/*!40000 ALTER TABLE `chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lecturer`
--

DROP TABLE IF EXISTS `lecturer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lecturer` (
  `userid` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `numOfTopicCreated` int(11) NOT NULL,
  PRIMARY KEY (`userid`),
  CONSTRAINT `lecturer_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `user` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lecturer`
--

LOCK TABLES `lecturer` WRITE;
/*!40000 ALTER TABLE `lecturer` DISABLE KEYS */;
INSERT INTO `lecturer` VALUES (5001,'Chong JiaHao',0),(5002,'KYAW MYO AUNG',2);
/*!40000 ALTER TABLE `lecturer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson`
--

DROP TABLE IF EXISTS `lesson`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lesson` (
  `lessonid` int(11) NOT NULL,
  `topicid` varchar(5) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `details` varchar(6000) NOT NULL,
  `file` char(1) DEFAULT NULL,
  `description` varchar(6000) DEFAULT NULL,
  PRIMARY KEY (`topicid`,`lessonid`),
  CONSTRAINT `lesson_ibfk_1` FOREIGN KEY (`topicid`) REFERENCES `topic` (`topicid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson`
--

LOCK TABLES `lesson` WRITE;
/*!40000 ALTER TABLE `lesson` DISABLE KEYS */;
INSERT INTO `lesson` VALUES 
(1,'CT001','What is Knapsack Problem','It derives its name from the problem faced by someone who is constrained by a fixed-size knapsack and must fill it with the most valuable items. <br /><br />The problem often arises in resource allocation where there are financial constraints and is studied in fields such as combinatorics, computer science, complexity theory, cryptography, applied mathematics, and daily fantasy sports.<br /><br />The knapsack problem has been studied for more than a century, with early works dating as far back as 1897. The name \\"knapsack problem\\" dates back to the early works of mathematician Tobias Dantzig (1884–1956), and refers to the commonplace problem of packing the most valuable or useful items without overloading the luggage.','N','The knapsack problem or rucksack problem is a problem in combinatorial optimization: Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible'),(1,'CT002','What is AES','The Advanced Encryption Standard (AES), also known by its original name Rijndael (Dutch pronunciation: [ˈrɛindaːl]),[3] is a specification for the encryption of electronic data established by the U.S. National Institute of Standards and Technology (NIST) in 2001.[4]AES is a subset of the Rijndael block cipher[3] developed by two Belgian cryptographers, Vincent Rijmen and Joan Daemen, who submitted a proposal[5] to NIST during the AES selection process.[6] Rijndael is a family of ciphers with different key and block sizes.For AES, NIST selected three members of the Rijndael family, each with a block size of 128 bits, but three different key lengths: 128, 192 and 256 bits.','N','Advanced Encryption Standard (AES)');
/*!40000 ALTER TABLE `lesson` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz`
--

DROP TABLE IF EXISTS `quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz` (
  `questionid` int(11) NOT NULL,
  `topicid` varchar(5) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` varchar(255) NOT NULL,
  `rightAns` varchar(255) NOT NULL,
  PRIMARY KEY (`topicid`,`questionid`),
  CONSTRAINT `quiz_ibfk_1` FOREIGN KEY (`topicid`) REFERENCES `topic` (`topicid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz`
--

LOCK TABLES `quiz` WRITE;
/*!40000 ALTER TABLE `quiz` DISABLE KEYS */;
INSERT INTO `quiz` VALUES (1,'CT001','Who is the creator of Trapdoor Knapsack Cryptosystems?','A. Merkle and Hellman;B. Diffie and Hellman;C. Shannon;D. Japit','A. Merkle and Hellman'),(2,'CT001','Trapdoor Knapsack makes use of a difficult problem. What is it?','A. Riemann Hypothesis;B.Subset Sum Problem;C.P vs. NP Problem.;D.Navier–Stokes Equation.','B.Subset Sum Problem');
/*!40000 ALTER TABLE `quiz` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student` (
  `userid` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `numOfTopicCompleted` int(11) NOT NULL,
  `totalPoints` int(11) NOT NULL,
  PRIMARY KEY (`userid`),
  CONSTRAINT `student_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `user` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (1001,'Wu ChuJun',0,0),(1002,'Marcus Tan',0,0);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studentRecord`
--

DROP TABLE IF EXISTS `studentRecord`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `studentRecord` (
  `userid` int(11) NOT NULL,
  `topicid` varchar(5) NOT NULL,
  `lessonid` int(11) NOT NULL,
  PRIMARY KEY (`userid`,`topicid`),
  KEY `fk_recordtopic` (`topicid`),
  CONSTRAINT `studentRecord_ibfk_1` FOREIGN KEY (`topicid`) REFERENCES `topic` (`topicid`),
  CONSTRAINT `studentRecord_ibfk_2` FOREIGN KEY (`userid`) REFERENCES `student` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `studentResult`
--

DROP TABLE IF EXISTS `studentResult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `studentResult` (
  `userid` int(11) NOT NULL,
  `topicid` varchar(5) NOT NULL,
  `marks` int(11) NOT NULL,
  PRIMARY KEY (`userid`,`topicid`),
  KEY `fk_resulttopic` (`topicid`),
  CONSTRAINT `studentResult_ibfk_1` FOREIGN KEY (`topicid`) REFERENCES `topic` (`topicid`),
  CONSTRAINT `studentResult_ibfk_2` FOREIGN KEY (`userid`) REFERENCES `student` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studentResult`
--

--
-- Table structure for table `topic`
--

DROP TABLE IF EXISTS `topic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `topic` (
  `topicid` varchar(5) NOT NULL,
  `topicName` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `numOfLesson` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  PRIMARY KEY (`topicid`),
  KEY `fk_creator` (`creator`),
  CONSTRAINT `topic_ibfk_1` FOREIGN KEY (`creator`) REFERENCES `lecturer` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topic`
--

LOCK TABLES `topic` WRITE;
/*!40000 ALTER TABLE `topic` DISABLE KEYS */;
INSERT INTO `topic` VALUES ('CT001','Trapdoor Knapsack Algorithm','Knapsack Cryptosystems are cryptosystems which security is based on the hardness of solving the knapsack problem. ',1,5001),('CT002','Advanced Encryption Standard (AES)','A specification for the encryption of electronic data established by the U.S. National Institute of Standards and Technology (NIST) in 2001.',1,5002);
/*!40000 ALTER TABLE `topic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `userid` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `userType` varchar(10) NOT NULL,
  PRIMARY KEY (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1001,'student1','student'),(1002,'student2','student'),(5001,'lecturer1','lecturer'),(5002,'lecturer2','lecturer');
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

-- Dump completed on 2019-08-07 10:14:42
