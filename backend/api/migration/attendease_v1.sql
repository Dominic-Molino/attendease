-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2024 at 05:49 PM
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
  `event_start_date` date DEFAULT NULL,
  `event_end_date` date DEFAULT NULL,
  `event_registration_start` date DEFAULT NULL,
  `event_registration_end` date DEFAULT NULL,
  `requirement` varchar(16) DEFAULT NULL,
  `session` varchar(15) DEFAULT NULL,
  `event_img` longblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`event_id`, `event_name`, `event_description`, `event_location`, `event_start_date`, `event_end_date`, `event_registration_start`, `event_registration_end`, `requirement`, `session`, `event_img`) VALUES
(33, 'Updated Tech Conference 2024', 'Updated annual tech conference featuring the latest trends and innovations.', 'Updated Convention Center', '2024-09-15', '2024-09-17', '2024-07-01', '2024-08-31', '2', '1', 0x30),
(35, 'Sample Event', 'This is a sample event description.', 'Sample Location', '2024-05-10', '2024-05-12', '2024-04-10', '2024-04-30', 'Sample Requireme', 'Sample Session', 0x30),
(36, 'Tech Conference 2024', 'Annual tech conference featuring the latest trends and innovations.', 'Convention Center', '2024-09-15', '2024-09-17', '2024-07-01', '2024-08-31', 'Tech enthusiasts', 'Full day', 0x30);

-- --------------------------------------------------------

--
-- Table structure for table `event_registration`
--

CREATE TABLE `event_registration` (
  `registration_id` int(10) UNSIGNED NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `event_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_registration`
--

INSERT INTO `event_registration` (`registration_id`, `registration_date`, `user_id`, `event_id`) VALUES
(1, '2024-04-20 01:30:00', 1, 1),
(2, '2024-04-21 03:45:00', 2, 1),
(3, '2024-04-23 06:15:00', 3, 2);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `year_level` varchar(50) NOT NULL,
  `block` varchar(50) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `user_image` longblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `first_name`, `last_name`, `year_level`, `block`, `course`, `email`, `password`, `user_image`) VALUES
(3, 'John', 'Doe', 'Junior', 'B-101', 'Computer Sci', 'john.doe@example.com', 'password', NULL),
(4, 'Jane', 'Smith', 'Senior', 'A-201', 'Engineering', 'jane.smith@example.com', 'password', NULL),
(5, 'Alice', 'Johnson', 'Sophomore', 'C-301', 'Business', 'alice.johnson@example.com', 'password', NULL),
(7, 'Updated First Name', 'Updated Last Name', 'Updated Year Level', 'Updated Block', 'Updated Course', 'updated@example.com', 'securepassword', NULL),
(9, 'Updated First Name', 'Updated Last Name', 'Updated Year Level', 'Updated Block', 'Updated Course', 'updatedasdad@example.com', '1231312321323', NULL),
(11, 'Updated First Name', 'Updated Last Name', 'Updated Block', 'Updated Year Level', 'Updated Course', 'updatedasdsdad@example.com', '1231312321323', NULL),
(13, 'John', 'Doe', '3', 'A', 'Computer Science', 'john.doe@sample.com', '1231312321323', NULL),
(14, '', '', '', 'b', 'cs', 'dommolino@gmail.com', 'hades2801', NULL),
(15, 'Updated Fidasdrst Name', 'Updated Last Name', 'Updated Year Level', 'Updated Block', 'Updated Course', 'updat@xdasdasample.com', '1231312321323', NULL),
(16, 'dominic', 'molino', '2', 'B', 'CS', 'estrellaukiyo@gmail.com', '$2y$10$2HrbcSwH6Ojn3cHJTpz.g.7OMd3UiEfnlNFB/vXoX22uW4Wi3blOq', NULL),
(18, 'John', 'Doe', '3', 'A', 'Computer Science', 'johndoe@example.com', '$2y$10$wFmL848JiIm3RVXJuuX71empwcaAzK0eGLz9Qh24/I3nIl/UlSlRq', NULL),
(19, 'estrella', 'yue', '2', 'b', 'bscs', '202210298@gordoncollege.edu.ph', '$2y$10$lCfzv8AZ6cFEKrrgNrAS1eKpH.a6ZjN8CyauCt2pBK8m94y4U0ADS', NULL),
(20, 'dominic', 'molino', '2', 'B', 'BSCS', 'imdumb2003@gmail.com', '$2y$10$RMTjqYiOrYBHGriT.1PK/uFITLMB.hc0Ej3srrT15lzepAROLaYVK', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`);

--
-- Indexes for table `event_registration`
--
ALTER TABLE `event_registration`
  ADD PRIMARY KEY (`registration_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `event_registration`
--
ALTER TABLE `event_registration`
  MODIFY `registration_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
