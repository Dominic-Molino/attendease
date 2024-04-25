  -- phpMyAdmin SQL Dump
  -- version 5.2.1
  -- https://www.phpmyadmin.net/
  --
  -- Host: 127.0.0.1
  -- Generation Time: Apr 25, 2024 at 03:21 AM
  -- Server version: 10.4.32-MariaDB
  -- PHP Version: 8.2.12

  SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
  START TRANSACTION;
  SET time_zone = "+00:00";


  /*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
  /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
  /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
  /*!40101 SET NAMES utf8mb4 */;

  --
  -- Database: `attendease_v1`
  --

  -- --------------------------------------------------------

  --
  -- Table structure for table `events`
  --

  CREATE TABLE `events` (
    `event_id` int(10) UNSIGNED NOT NULL,
    `event_name` varchar(100) NOT NULL,
    `event_description` text DEFAULT NULL,
    `event_location` varchar(255) DEFAULT NULL,
    `event_create_date` timestamp NOT NULL DEFAULT current_timestamp(),
    `event_start_date` datetime DEFAULT NULL,
    `event_end_date` datetime DEFAULT NULL,
    `event_registration_start` datetime DEFAULT NULL,
    `event_registration_end` datetime DEFAULT NULL,
    `event_status` varchar(50) DEFAULT NULL,
    `requirement_id` int(10) UNSIGNED DEFAULT NULL,
    `session_id` int(10) UNSIGNED DEFAULT NULL,
    `created_by` int(10) UNSIGNED DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  --
  -- Dumping data for table `events`
  --

  -- --------------------------------------------------------

  --
  -- Table structure for table `event_image`
  --

  CREATE TABLE `event_image` (
    `event_image_id` int(10) UNSIGNED NOT NULL,
    `event_id` int(10) UNSIGNED NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -- --------------------------------------------------------

  --
  -- Table structure for table `event_registration`
  --

  CREATE TABLE `event_registration` (
    `registration_id` int(10) UNSIGNED NOT NULL,
    `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
    `user_id` int(10) UNSIGNED DEFAULT NULL,
    `event_id` int(10) UNSIGNED DEFAULT NULL,
    `requirement_id` int(10) UNSIGNED DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -- --------------------------------------------------------

  --
  -- Table structure for table `requirements`
  --

  CREATE TABLE `requirements` (
    `requirement_id` int(10) UNSIGNED NOT NULL,
    `requirement_name` varchar(100) NOT NULL,
    `requirement_description` text DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -- --------------------------------------------------------

  --
  -- Table structure for table `session_mode`
  --

  CREATE TABLE `session_mode` (
    `session_id` int(10) UNSIGNED NOT NULL,
    `session_name` varchar(50) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -- --------------------------------------------------------

  --
  -- Table structure for table `user`
  --

  CREATE TABLE `user` (
    `user_id` int(10) UNSIGNED NOT NULL,
    `first_name` varchar(50) NOT NULL,
    `last_name` varchar(50) NOT NULL,
    `year_level` varchar(50) DEFAULT NULL,
    `block` varchar(50) DEFAULT NULL,
    `course` varchar(100) DEFAULT NULL,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `registration_date` timestamp NOT NULL DEFAULT current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  --
  -- Table structure for table `user_image`
  --

  CREATE TABLE `user_image` (
    `user_image_id` int(10) UNSIGNED NOT NULL,
    `user_id` int(10) UNSIGNED NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  --
  -- Indexes for dumped tables
  --

  --
  -- Indexes for table `events`
  --
  ALTER TABLE `events`
    ADD PRIMARY KEY (`event_id`),
    ADD KEY `requirement_id` (`requirement_id`),
    ADD KEY `session_id` (`session_id`),
    ADD KEY `created_by` (`created_by`);

  --
  -- Indexes for table `event_image`
  --
  ALTER TABLE `event_image`
    ADD PRIMARY KEY (`event_image_id`),
    ADD KEY `event_id` (`event_id`);

  --
  -- Indexes for table `event_registration`
  --
  ALTER TABLE `event_registration`
    ADD PRIMARY KEY (`registration_id`),
    ADD KEY `user_id` (`user_id`),
    ADD KEY `event_id` (`event_id`),
    ADD KEY `requirement_id` (`requirement_id`);

  --
  -- Indexes for table `requirements`
  --
  ALTER TABLE `requirements`
    ADD PRIMARY KEY (`requirement_id`);

  --
  -- Indexes for table `session_mode`
  --
  ALTER TABLE `session_mode`
    ADD PRIMARY KEY (`session_id`);

  --
  -- Indexes for table `user`
  --
  ALTER TABLE `user`
    ADD PRIMARY KEY (`user_id`),
    ADD UNIQUE KEY `email` (`email`);

  --
  -- Indexes for table `user_image`
  --
  ALTER TABLE `user_image`
    ADD PRIMARY KEY (`user_image_id`),
    ADD KEY `user_id` (`user_id`);

  --
  -- AUTO_INCREMENT for dumped tables
  --

  --
  -- AUTO_INCREMENT for table `events`
  --
  ALTER TABLE `events`
    MODIFY `event_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

  --
  -- AUTO_INCREMENT for table `event_image`
  --
  ALTER TABLE `event_image`
    MODIFY `event_image_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

  --
  -- AUTO_INCREMENT for table `event_registration`
  --
  ALTER TABLE `event_registration`
    MODIFY `registration_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

  --
  -- AUTO_INCREMENT for table `requirements`
  --
  ALTER TABLE `requirements`
    MODIFY `requirement_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

  --
  -- AUTO_INCREMENT for table `session_mode`
  --
  ALTER TABLE `session_mode`
    MODIFY `session_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

  --
  -- AUTO_INCREMENT for table `user`
  --
  ALTER TABLE `user`
    MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

  --
  -- AUTO_INCREMENT for table `user_image`
  --
  ALTER TABLE `user_image`
    MODIFY `user_image_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

  --
  -- Constraints for dumped tables
  --

  --
  -- Constraints for table `events`
  --
  ALTER TABLE `events`
    ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`requirement_id`) REFERENCES `requirements` (`requirement_id`),
    ADD CONSTRAINT `events_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `session_mode` (`session_id`),