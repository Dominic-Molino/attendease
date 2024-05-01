-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 01, 2024 at 07:13 AM
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
-- Database: `attendease`
--

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `year_level` int(11) NOT NULL,
  `student_block` varchar(10) NOT NULL,
  `course` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `pwd` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `first_name`, `last_name`, `year_level`, `student_block`, `course`, `email`, `pwd`) VALUES
(1, 'John', 'Doe', 2, 'A', 'Computer Science', 'john.doe@example.com', 'password123'),
(2, 'Jane', 'Smith', 1, 'B', 'Mathematics', 'jane.smith@example.com', 'securepassword'),
(3, 'Michael', 'Johnson', 3, 'C', 'Engineering', 'michael.johnson@example.com', 'strongpassword'),
(4, 'Emily', 'Brown', 2, 'A', 'Psychology', 'emily.brown@example.com', 'mypassword123'),
(5, 'David', 'Wilson', 4, 'D', 'Biology', 'david.wilson@example.com', 'letmein'),
(6, 'Alice', 'Johnson', 1, 'A', 'Computer Science', 'alice.johnson@example.com', 'password123'),
(7, 'Alice', 'Johnson', 1, 'A', 'Computer Science', 'alicejohnson@example.com', 'password123'),
(8, 'dom', 'molino', 2, 'b', 'cs', 'dom.molino@gmail.com', '123456789'),
(9, 'deo', 'molino', 2, 'b', 'cs', 'deo@gmail.com', 'hades2801');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
