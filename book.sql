/*
Navicat MySQL Data Transfer

Source Server         : Account
Source Server Version : 50726
Source Host           : localhost:3306
Source Database       : book

Target Server Type    : MYSQL
Target Server Version : 50726
File Encoding         : 65001

Date: 2020-06-14 17:36:39
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `id` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of admin
-- ----------------------------

-- ----------------------------
-- Table structure for book_list
-- ----------------------------
DROP TABLE IF EXISTS `book_list`;
CREATE TABLE `book_list` (
  `title` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `bookconcern` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `pulicationtime` datetime(6) NOT NULL,
  `stock` int(255) NOT NULL,
  `surplus` int(255) NOT NULL,
  PRIMARY KEY (`code`),
  KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of book_list
-- ----------------------------

-- ----------------------------
-- Table structure for borrow_book
-- ----------------------------
DROP TABLE IF EXISTS `borrow_book`;
CREATE TABLE `borrow_book` (
  `id` int(100) NOT NULL,
  `code` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `reproduction` varchar(255) NOT NULL,
  PRIMARY KEY (`id`,`code`),
  KEY `borrow_book_ibfk_2` (`code`),
  CONSTRAINT `borrow_book_ibfk_1` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `borrow_book_ibfk_2` FOREIGN KEY (`code`) REFERENCES `book_list` (`code`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of borrow_book
-- ----------------------------

-- ----------------------------
-- Table structure for note
-- ----------------------------
DROP TABLE IF EXISTS `note`;
CREATE TABLE `note` (
  `title` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of note
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(100) NOT NULL,
  `username` varchar(255) NOT NULL,
  `college` varchar(255) NOT NULL,
  `class` varchar(255) NOT NULL,
  `phonenumber` int(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user
-- ----------------------------
