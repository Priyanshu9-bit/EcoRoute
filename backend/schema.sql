-- EcoRoute Database Schema
-- Generated for manual setup

CREATE DATABASE IF NOT EXISTS `ecoroute`;
USE `ecoroute`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_status` enum('ACTIVE','PENDING','DISABLED') NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ROLE_USER','ROLE_ADMIN') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `user_profiles`
--
DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `age` int DEFAULT NULL,
  `medical_information` text,
  `profile_completion_status` bit(1) NOT NULL,
  `vehicle_type` enum('BIKE','CAR','BUS','TRUCK','EV') DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_e5h89rk3ijvdmaiig4srogdc6` (`user_id`),
  CONSTRAINT `FKjcad5nfve11khsnpwj1mv8frj` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `journeys`
--
DROP TABLE IF EXISTS `journeys`;
CREATE TABLE `journeys` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `journey_date` datetime(6) NOT NULL,
  `source` varchar(255) NOT NULL,
  `status` enum('PLANNED','COMPLETED','CANCELLED') NOT NULL,
  `travel_type` enum('SOLO','FRIENDS','FAMILY') NOT NULL,
  `vehicle_type` enum('BIKE','CAR','BUS','TRUCK','EV') NOT NULL,
  `user_id` bigint NOT NULL,
  `distance` double DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `dest_lat` double DEFAULT NULL,
  `dest_lng` double DEFAULT NULL,
  `source_lat` double DEFAULT NULL,
  `source_lng` double DEFAULT NULL,
  `selected_route_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1um7r8cm6rnn4dinfmarjjmqv` (`user_id`),
  CONSTRAINT `FK1um7r8cm6rnn4dinfmarjjmqv` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `journey_required_facilities`
--
DROP TABLE IF EXISTS `journey_required_facilities`;
CREATE TABLE `journey_required_facilities` (
  `journey_id` bigint NOT NULL,
  `facility` enum('HOSPITAL','HOTEL','RESTAURANT','GARAGE','FUEL_STATION','EV_CHARGING') DEFAULT NULL,
  KEY `FK9uyld62rgpkf0cqicquvrj4lr` (`journey_id`),
  CONSTRAINT `FK9uyld62rgpkf0cqicquvrj4lr` FOREIGN KEY (`journey_id`) REFERENCES `journeys` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `journey_route_preferences`
--
DROP TABLE IF EXISTS `journey_route_preferences`;
CREATE TABLE `journey_route_preferences` (
  `journey_id` bigint NOT NULL,
  `preference` enum('SHORTEST','FASTEST','SAFEST','HEALTHIEST') DEFAULT NULL,
  KEY `FKnkgvqc0vi1yyjmachcdwg8wl8` (`journey_id`),
  CONSTRAINT `FKnkgvqc0vi1yyjmachcdwg8wl8` FOREIGN KEY (`journey_id`) REFERENCES `journeys` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `routes`
--
DROP TABLE IF EXISTS `routes`;
CREATE TABLE `routes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `distance` double DEFAULT NULL,
  `duration` double DEFAULT NULL,
  `geometry` longtext,
  `profile` varchar(255) DEFAULT NULL,
  `summary` varchar(255) DEFAULT NULL,
  `journey_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKo2jtve386bul2grra8og4hx6d` (`journey_id`),
  CONSTRAINT `FKo2jtve386bul2grra8og4hx6d` FOREIGN KEY (`journey_id`) REFERENCES `journeys` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `saved_routes`
--
DROP TABLE IF EXISTS `saved_routes`;
CREATE TABLE `saved_routes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `distance` varchar(255) DEFAULT NULL,
  `source` varchar(255) NOT NULL,
  `vehicle_type` enum('BIKE','CAR','BUS','TRUCK','EV') DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4u5kcleplnyurtlfmmenbyy4e` (`user_id`),
  CONSTRAINT `FK4u5kcleplnyurtlfmmenbyy4e` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `road_reports`
--
DROP TABLE IF EXISTS `road_reports`;
CREATE TABLE `road_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `report_type` enum('CONSTRUCTION','POTHOLE','ACCIDENT','ROAD_BLOCKAGE','WATERLOGGING','DAMAGED_ROAD') NOT NULL,
  `status` enum('PENDING','VERIFIED','RESOLVED','REJECTED') NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKfl687a8ea03ph4jch27hgljdu` (`user_id`),
  CONSTRAINT `FKfl687a8ea03ph4jch27hgljdu` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
