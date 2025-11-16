-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2025 at 01:39 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbhighschoolportal`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_info`
--

CREATE TABLE `admin_info` (
  `user_id` varchar(20) NOT NULL,
  `fname` varchar(50) NOT NULL,
  `lname` varchar(50) NOT NULL,
  `mname` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_info`
--

INSERT INTO `admin_info` (`user_id`, `fname`, `lname`, `mname`, `email`, `position`, `created_at`) VALUES
('ADM-001', 'Maria', 'Garcia', 'Santos', 'admin@mseuf.edu.ph', 'System Administrator', '2025-11-06 09:18:52'),
('ADM-002', 'max', 'max', NULL, 'admin2@gmail.com', 'Administrator', '2025-11-12 20:27:57');

-- --------------------------------------------------------

--
-- Table structure for table `grade_records`
--

CREATE TABLE `grade_records` (
  `grade_id` int(11) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `sub_code` varchar(20) NOT NULL,
  `teacher_id` varchar(20) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `yearlevel` varchar(20) NOT NULL,
  `school_year` varchar(9) NOT NULL,
  `period_id` int(11) NOT NULL,
  `grading_period` varchar(50) NOT NULL,
  `final_grade` decimal(5,2) DEFAULT NULL,
  `remarks` varchar(50) DEFAULT NULL,
  `submission_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grade_records`
--

INSERT INTO `grade_records` (`grade_id`, `user_id`, `sub_code`, `teacher_id`, `section_id`, `yearlevel`, `school_year`, `period_id`, `grading_period`, `final_grade`, `remarks`, `submission_id`, `created_at`) VALUES
(1, 'SID-001', 'FIL7', 'TID-001', 1, '7', '2023-2024', 1, '1st Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(2, 'SID-001', 'ENG7', 'TID-001', 1, '7', '2023-2024', 1, '1st Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(3, 'SID-001', 'MATH7', 'TID-002', 1, '7', '2023-2024', 1, '1st Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(4, 'SID-001', 'SCI7', 'TID-002', 1, '7', '2023-2024', 1, '1st Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(5, 'SID-001', 'AP7', 'TID-001', 1, '7', '2023-2024', 1, '1st Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(6, 'SID-001', 'ESP7', 'TID-001', 1, '7', '2023-2024', 1, '1st Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(7, 'SID-001', 'TLE7', 'TID-002', 1, '7', '2023-2024', 1, '1st Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(8, 'SID-001', 'MAPEH7', 'TID-002', 1, '7', '2023-2024', 1, '1st Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(9, 'SID-001', 'COMP7', 'TID-002', 1, '7', '2023-2024', 1, '1st Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(10, 'SID-001', 'FIL7', 'TID-001', 1, '7', '2023-2024', 2, '2nd Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(11, 'SID-001', 'ENG7', 'TID-001', 1, '7', '2023-2024', 2, '2nd Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(12, 'SID-001', 'MATH7', 'TID-002', 1, '7', '2023-2024', 2, '2nd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(13, 'SID-001', 'SCI7', 'TID-002', 1, '7', '2023-2024', 2, '2nd Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(14, 'SID-001', 'AP7', 'TID-001', 1, '7', '2023-2024', 2, '2nd Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(15, 'SID-001', 'ESP7', 'TID-001', 1, '7', '2023-2024', 2, '2nd Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(16, 'SID-001', 'TLE7', 'TID-002', 1, '7', '2023-2024', 2, '2nd Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(17, 'SID-001', 'MAPEH7', 'TID-002', 1, '7', '2023-2024', 2, '2nd Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(18, 'SID-001', 'COMP7', 'TID-002', 1, '7', '2023-2024', 2, '2nd Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(19, 'SID-001', 'FIL7', 'TID-001', 1, '7', '2023-2024', 3, '3rd Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(20, 'SID-001', 'ENG7', 'TID-001', 1, '7', '2023-2024', 3, '3rd Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(21, 'SID-001', 'MATH7', 'TID-002', 1, '7', '2023-2024', 3, '3rd Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(22, 'SID-001', 'SCI7', 'TID-002', 1, '7', '2023-2024', 3, '3rd Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(23, 'SID-001', 'AP7', 'TID-001', 1, '7', '2023-2024', 3, '3rd Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(24, 'SID-001', 'ESP7', 'TID-001', 1, '7', '2023-2024', 3, '3rd Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(25, 'SID-001', 'TLE7', 'TID-002', 1, '7', '2023-2024', 3, '3rd Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(26, 'SID-001', 'MAPEH7', 'TID-002', 1, '7', '2023-2024', 3, '3rd Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(27, 'SID-001', 'COMP7', 'TID-002', 1, '7', '2023-2024', 3, '3rd Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(28, 'SID-001', 'FIL7', 'TID-001', 1, '7', '2023-2024', 4, '4th Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(29, 'SID-001', 'ENG7', 'TID-001', 1, '7', '2023-2024', 4, '4th Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(30, 'SID-001', 'MATH7', 'TID-002', 1, '7', '2023-2024', 4, '4th Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(31, 'SID-001', 'SCI7', 'TID-002', 1, '7', '2023-2024', 4, '4th Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(32, 'SID-001', 'AP7', 'TID-001', 1, '7', '2023-2024', 4, '4th Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(33, 'SID-001', 'ESP7', 'TID-001', 1, '7', '2023-2024', 4, '4th Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(34, 'SID-001', 'TLE7', 'TID-002', 1, '7', '2023-2024', 4, '4th Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(35, 'SID-001', 'MAPEH7', 'TID-002', 1, '7', '2023-2024', 4, '4th Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(36, 'SID-001', 'COMP7', 'TID-002', 1, '7', '2023-2024', 4, '4th Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(37, 'SID-002', 'FIL8', 'TID-006', 2, '8', '2023-2024', 5, '1st Quarter', 90.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(38, 'SID-002', 'ENG8', 'TID-006', 2, '8', '2023-2024', 5, '1st Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(39, 'SID-002', 'MATH8', 'TID-002', 2, '8', '2023-2024', 5, '1st Quarter', 89.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(40, 'SID-002', 'SCI8', 'TID-002', 2, '8', '2023-2024', 5, '1st Quarter', 91.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(41, 'SID-002', 'AP8', 'TID-001', 2, '8', '2023-2024', 5, '1st Quarter', 90.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(42, 'SID-002', 'ESP8', 'TID-001', 2, '8', '2023-2024', 5, '1st Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(43, 'SID-002', 'TLE8', 'TID-002', 2, '8', '2023-2024', 5, '1st Quarter', 91.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(44, 'SID-002', 'MAPEH8', 'TID-002', 2, '8', '2023-2024', 5, '1st Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(45, 'SID-002', 'COMP8', 'TID-002', 2, '8', '2023-2024', 5, '1st Quarter', 90.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(46, 'SID-002', 'FIL8', 'TID-006', 2, '8', '2023-2024', 6, '2nd Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(47, 'SID-002', 'ENG8', 'TID-006', 2, '8', '2023-2024', 6, '2nd Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(48, 'SID-002', 'MATH8', 'TID-002', 2, '8', '2023-2024', 6, '2nd Quarter', 91.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(49, 'SID-002', 'SCI8', 'TID-002', 2, '8', '2023-2024', 6, '2nd Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(50, 'SID-002', 'AP8', 'TID-001', 2, '8', '2023-2024', 6, '2nd Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(51, 'SID-002', 'ESP8', 'TID-001', 2, '8', '2023-2024', 6, '2nd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(52, 'SID-002', 'TLE8', 'TID-002', 2, '8', '2023-2024', 6, '2nd Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(53, 'SID-002', 'MAPEH8', 'TID-002', 2, '8', '2023-2024', 6, '2nd Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(54, 'SID-002', 'COMP8', 'TID-002', 2, '8', '2023-2024', 6, '2nd Quarter', 91.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(55, 'SID-002', 'FIL8', 'TID-006', 2, '8', '2023-2024', 7, '3rd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(56, 'SID-002', 'ENG8', 'TID-006', 2, '8', '2023-2024', 7, '3rd Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(57, 'SID-002', 'MATH8', 'TID-002', 2, '8', '2023-2024', 7, '3rd Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(58, 'SID-002', 'SCI8', 'TID-002', 2, '8', '2023-2024', 7, '3rd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(59, 'SID-002', 'AP8', 'TID-001', 2, '8', '2023-2024', 7, '3rd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(60, 'SID-002', 'ESP8', 'TID-001', 2, '8', '2023-2024', 7, '3rd Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(61, 'SID-002', 'TLE8', 'TID-002', 2, '8', '2023-2024', 7, '3rd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(62, 'SID-002', 'MAPEH8', 'TID-002', 2, '8', '2023-2024', 7, '3rd Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(63, 'SID-002', 'COMP8', 'TID-002', 2, '8', '2023-2024', 7, '3rd Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(64, 'SID-002', 'FIL8', 'TID-006', 2, '8', '2023-2024', 8, '4th Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(65, 'SID-002', 'ENG8', 'TID-006', 2, '8', '2023-2024', 8, '4th Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(66, 'SID-002', 'MATH8', 'TID-002', 2, '8', '2023-2024', 8, '4th Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(67, 'SID-002', 'SCI8', 'TID-002', 2, '8', '2023-2024', 8, '4th Quarter', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(68, 'SID-002', 'AP8', 'TID-001', 2, '8', '2023-2024', 8, '4th Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(69, 'SID-002', 'ESP8', 'TID-001', 2, '8', '2023-2024', 8, '4th Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(70, 'SID-002', 'TLE8', 'TID-002', 2, '8', '2023-2024', 8, '4th Quarter', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(71, 'SID-002', 'MAPEH8', 'TID-002', 2, '8', '2023-2024', 8, '4th Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(72, 'SID-002', 'COMP8', 'TID-002', 2, '8', '2023-2024', 8, '4th Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(73, 'SID-003', 'FIL9', 'TID-001', 3, '9', '2023-2024', 9, '1st Quarter', 91.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(74, 'SID-003', 'ENG9', 'TID-001', 3, '9', '2023-2024', 9, '1st Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(75, 'SID-003', 'MATH9', 'TID-002', 3, '9', '2023-2024', 9, '1st Quarter', 90.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(76, 'SID-003', 'SCI9', 'TID-002', 3, '9', '2023-2024', 9, '1st Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(77, 'SID-003', 'AP9', 'TID-001', 3, '9', '2023-2024', 9, '1st Quarter', 91.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(78, 'SID-003', 'ESP9', 'TID-001', 3, '9', '2023-2024', 9, '1st Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(79, 'SID-003', 'TLE9', 'TID-002', 3, '9', '2023-2024', 9, '1st Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(80, 'SID-003', 'MAPEH9', 'TID-002', 3, '9', '2023-2024', 9, '1st Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(81, 'SID-003', 'COMP9', 'TID-002', 3, '9', '2023-2024', 9, '1st Quarter', 91.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(82, 'SID-003', 'FIL9', 'TID-001', 3, '9', '2023-2024', 10, '2nd Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(83, 'SID-003', 'ENG9', 'TID-001', 3, '9', '2023-2024', 10, '2nd Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(84, 'SID-003', 'MATH9', 'TID-002', 3, '9', '2023-2024', 10, '2nd Quarter', 91.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(85, 'SID-003', 'SCI9', 'TID-002', 3, '9', '2023-2024', 10, '2nd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(86, 'SID-003', 'AP9', 'TID-001', 3, '9', '2023-2024', 10, '2nd Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(87, 'SID-003', 'ESP9', 'TID-001', 3, '9', '2023-2024', 10, '2nd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(88, 'SID-003', 'TLE9', 'TID-002', 3, '9', '2023-2024', 10, '2nd Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(89, 'SID-003', 'MAPEH9', 'TID-002', 3, '9', '2023-2024', 10, '2nd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(90, 'SID-003', 'COMP9', 'TID-002', 3, '9', '2023-2024', 10, '2nd Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(91, 'SID-003', 'FIL9', 'TID-001', 3, '9', '2023-2024', 11, '3rd Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(92, 'SID-003', 'ENG9', 'TID-001', 3, '9', '2023-2024', 11, '3rd Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(93, 'SID-003', 'MATH9', 'TID-002', 3, '9', '2023-2024', 11, '3rd Quarter', 91.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(94, 'SID-003', 'SCI9', 'TID-002', 3, '9', '2023-2024', 11, '3rd Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(95, 'SID-003', 'AP9', 'TID-001', 3, '9', '2023-2024', 11, '3rd Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(96, 'SID-003', 'ESP9', 'TID-001', 3, '9', '2023-2024', 11, '3rd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(97, 'SID-003', 'TLE9', 'TID-002', 3, '9', '2023-2024', 11, '3rd Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(98, 'SID-003', 'MAPEH9', 'TID-002', 3, '9', '2023-2024', 11, '3rd Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(99, 'SID-003', 'COMP9', 'TID-002', 3, '9', '2023-2024', 11, '3rd Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(100, 'SID-003', 'FIL9', 'TID-001', 3, '9', '2023-2024', 12, '4th Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(101, 'SID-003', 'ENG9', 'TID-001', 3, '9', '2023-2024', 12, '4th Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(102, 'SID-003', 'MATH9', 'TID-002', 3, '9', '2023-2024', 12, '4th Quarter', 92.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(103, 'SID-003', 'SCI9', 'TID-002', 3, '9', '2023-2024', 12, '4th Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(104, 'SID-003', 'AP9', 'TID-001', 3, '9', '2023-2024', 12, '4th Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(105, 'SID-003', 'ESP9', 'TID-001', 3, '9', '2023-2024', 12, '4th Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(106, 'SID-003', 'TLE9', 'TID-002', 3, '9', '2023-2024', 12, '4th Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(107, 'SID-003', 'MAPEH9', 'TID-002', 3, '9', '2023-2024', 12, '4th Quarter', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(108, 'SID-003', 'COMP9', 'TID-002', 3, '9', '2023-2024', 12, '4th Quarter', 93.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(109, 'SID-004', 'FIL10', 'TID-001', 4, '10', '2023-2024', 13, '1st Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(110, 'SID-004', 'ENG10', 'TID-001', 4, '10', '2023-2024', 13, '1st Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(111, 'SID-004', 'MATH10', 'TID-007', 4, '10', '2023-2024', 13, '1st Quarter', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(112, 'SID-004', 'SCI10', 'TID-007', 4, '10', '2023-2024', 13, '1st Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(113, 'SID-004', 'AP10', 'TID-001', 4, '10', '2023-2024', 13, '1st Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(114, 'SID-004', 'ESP10', 'TID-001', 4, '10', '2023-2024', 13, '1st Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(115, 'SID-004', 'TLE10', 'TID-002', 4, '10', '2023-2024', 13, '1st Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(116, 'SID-004', 'MAPEH10', 'TID-002', 4, '10', '2023-2024', 13, '1st Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(117, 'SID-004', 'COMP10', 'TID-002', 4, '10', '2023-2024', 13, '1st Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(118, 'SID-004', 'FIL10', 'TID-001', 4, '10', '2023-2024', 14, '2nd Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(119, 'SID-004', 'ENG10', 'TID-001', 4, '10', '2023-2024', 14, '2nd Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(120, 'SID-004', 'MATH10', 'TID-007', 4, '10', '2023-2024', 14, '2nd Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(121, 'SID-004', 'SCI10', 'TID-007', 4, '10', '2023-2024', 14, '2nd Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(122, 'SID-004', 'AP10', 'TID-001', 4, '10', '2023-2024', 14, '2nd Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(123, 'SID-004', 'ESP10', 'TID-001', 4, '10', '2023-2024', 14, '2nd Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(124, 'SID-004', 'TLE10', 'TID-002', 4, '10', '2023-2024', 14, '2nd Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(125, 'SID-004', 'MAPEH10', 'TID-002', 4, '10', '2023-2024', 14, '2nd Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(126, 'SID-004', 'COMP10', 'TID-002', 4, '10', '2023-2024', 14, '2nd Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(127, 'SID-004', 'FIL10', 'TID-001', 4, '10', '2023-2024', 15, '3rd Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(128, 'SID-004', 'ENG10', 'TID-001', 4, '10', '2023-2024', 15, '3rd Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(129, 'SID-004', 'MATH10', 'TID-007', 4, '10', '2023-2024', 15, '3rd Quarter', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(130, 'SID-004', 'SCI10', 'TID-007', 4, '10', '2023-2024', 15, '3rd Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(131, 'SID-004', 'AP10', 'TID-001', 4, '10', '2023-2024', 15, '3rd Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(132, 'SID-004', 'ESP10', 'TID-001', 4, '10', '2023-2024', 15, '3rd Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(133, 'SID-004', 'TLE10', 'TID-002', 4, '10', '2023-2024', 15, '3rd Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(134, 'SID-004', 'MAPEH10', 'TID-002', 4, '10', '2023-2024', 15, '3rd Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(135, 'SID-004', 'COMP10', 'TID-002', 4, '10', '2023-2024', 15, '3rd Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(136, 'SID-004', 'FIL10', 'TID-001', 4, '10', '2023-2024', 16, '4th Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(137, 'SID-004', 'ENG10', 'TID-001', 4, '10', '2023-2024', 16, '4th Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(138, 'SID-004', 'MATH10', 'TID-007', 4, '10', '2023-2024', 16, '4th Quarter', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(139, 'SID-004', 'SCI10', 'TID-007', 4, '10', '2023-2024', 16, '4th Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(140, 'SID-004', 'AP10', 'TID-001', 4, '10', '2023-2024', 16, '4th Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(141, 'SID-004', 'ESP10', 'TID-001', 4, '10', '2023-2024', 16, '4th Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(142, 'SID-004', 'TLE10', 'TID-002', 4, '10', '2023-2024', 16, '4th Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(143, 'SID-004', 'MAPEH10', 'TID-002', 4, '10', '2023-2024', 16, '4th Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(144, 'SID-004', 'COMP10', 'TID-002', 4, '10', '2023-2024', 16, '4th Quarter', 100.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(145, 'SID-005', 'ORALCOM11', 'TID-001', 5, '11', '2023-2024', 17, '1st Semester - Prelim', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(146, 'SID-005', 'KOMWIKA11', 'TID-001', 5, '11', '2023-2024', 17, '1st Semester - Prelim', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(147, 'SID-005', 'GENMATH11', 'TID-002', 5, '11', '2023-2024', 17, '1st Semester - Prelim', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(148, 'SID-005', 'EARTHSCI11', 'TID-002', 5, '11', '2023-2024', 17, '1st Semester - Prelim', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(149, 'SID-005', 'PHILO11', 'TID-001', 5, '11', '2023-2024', 17, '1st Semester - Prelim', 94.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(150, 'SID-005', 'PE1-11', 'TID-002', 5, '11', '2023-2024', 17, '1st Semester - Prelim', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(151, 'SID-005', 'MIL11', 'TID-001', 5, '11', '2023-2024', 17, '1st Semester - Prelim', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(152, 'SID-005', 'PRECAL11', 'TID-002', 5, '11', '2023-2024', 17, '1st Semester - Prelim', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(153, 'SID-005', 'GENCHEM1-11', 'TID-002', 5, '11', '2023-2024', 17, '1st Semester - Prelim', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(154, 'SID-005', 'ORALCOM11', 'TID-001', 5, '11', '2023-2024', 18, '1st Semester - Finals', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(155, 'SID-005', 'KOMWIKA11', 'TID-001', 5, '11', '2023-2024', 18, '1st Semester - Finals', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(156, 'SID-005', 'GENMATH11', 'TID-002', 5, '11', '2023-2024', 18, '1st Semester - Finals', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(157, 'SID-005', 'EARTHSCI11', 'TID-002', 5, '11', '2023-2024', 18, '1st Semester - Finals', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(158, 'SID-005', 'PHILO11', 'TID-001', 5, '11', '2023-2024', 18, '1st Semester - Finals', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(159, 'SID-005', 'PE1-11', 'TID-002', 5, '11', '2023-2024', 18, '1st Semester - Finals', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(160, 'SID-005', 'MIL11', 'TID-001', 5, '11', '2023-2024', 18, '1st Semester - Finals', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(161, 'SID-005', 'PRECAL11', 'TID-002', 5, '11', '2023-2024', 18, '1st Semester - Finals', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(162, 'SID-005', 'GENCHEM1-11', 'TID-002', 5, '11', '2023-2024', 18, '1st Semester - Finals', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(163, 'SID-005', 'READWRITE11', 'TID-001', 5, '11', '2023-2024', 19, '2nd Semester - Prelim', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(164, 'SID-005', 'PAGBASA11', 'TID-001', 5, '11', '2023-2024', 19, '2nd Semester - Prelim', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(165, 'SID-005', 'STAT11', 'TID-002', 5, '11', '2023-2024', 19, '2nd Semester - Prelim', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(166, 'SID-005', 'PHYSCI11', 'TID-002', 5, '11', '2023-2024', 19, '2nd Semester - Prelim', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(167, 'SID-005', 'PERSDEV11', 'TID-001', 5, '11', '2023-2024', 19, '2nd Semester - Prelim', 95.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(168, 'SID-005', 'PE2-11', 'TID-002', 5, '11', '2023-2024', 19, '2nd Semester - Prelim', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(169, 'SID-005', 'EMPTECH11', 'TID-001', 5, '11', '2023-2024', 19, '2nd Semester - Prelim', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(170, 'SID-005', 'BASICCAL11', 'TID-002', 5, '11', '2023-2024', 19, '2nd Semester - Prelim', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(171, 'SID-005', 'GENCHEM2-11', 'TID-002', 5, '11', '2023-2024', 19, '2nd Semester - Prelim', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(172, 'SID-005', 'READWRITE11', 'TID-001', 5, '11', '2023-2024', 20, '2nd Semester - Finals', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(173, 'SID-005', 'PAGBASA11', 'TID-001', 5, '11', '2023-2024', 20, '2nd Semester - Finals', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(174, 'SID-005', 'STAT11', 'TID-002', 5, '11', '2023-2024', 20, '2nd Semester - Finals', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(175, 'SID-005', 'PHYSCI11', 'TID-002', 5, '11', '2023-2024', 20, '2nd Semester - Finals', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(176, 'SID-005', 'PERSDEV11', 'TID-001', 5, '11', '2023-2024', 20, '2nd Semester - Finals', 96.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(177, 'SID-005', 'PE2-11', 'TID-002', 5, '11', '2023-2024', 20, '2nd Semester - Finals', 99.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(178, 'SID-005', 'EMPTECH11', 'TID-001', 5, '11', '2023-2024', 20, '2nd Semester - Finals', 97.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(179, 'SID-005', 'BASICCAL11', 'TID-002', 5, '11', '2023-2024', 20, '2nd Semester - Finals', 98.00, 'Passed', NULL, '2025-11-06 09:18:52'),
(180, 'SID-005', 'GENCHEM2-11', 'TID-002', 5, '11', '2023-2024', 20, '2nd Semester - Finals', 97.00, 'Passed', NULL, '2025-11-06 09:18:52');

-- --------------------------------------------------------

--
-- Table structure for table `grade_submissions`
--

CREATE TABLE `grade_submissions` (
  `submission_id` int(11) NOT NULL,
  `sub_code` varchar(20) NOT NULL,
  `section_id` int(11) NOT NULL,
  `teacher_id` varchar(20) NOT NULL,
  `school_year` varchar(9) NOT NULL,
  `period_id` int(11) NOT NULL,
  `submission_count` int(11) DEFAULT 1,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `can_edit` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grading_periods`
--

CREATE TABLE `grading_periods` (
  `period_id` int(11) NOT NULL,
  `school_year` varchar(9) NOT NULL,
  `yearlevel` varchar(20) NOT NULL,
  `grading_period` varchar(50) NOT NULL,
  `period_type` enum('Quarter','Semester') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `grade_input_start` date DEFAULT NULL,
  `grade_input_end` date DEFAULT NULL,
  `is_open` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grading_periods`
--

INSERT INTO `grading_periods` (`period_id`, `school_year`, `yearlevel`, `grading_period`, `period_type`, `start_date`, `end_date`, `grade_input_start`, `grade_input_end`, `is_open`, `created_at`) VALUES
(1, '2023-2024', '7', '1st Quarter', 'Quarter', '2023-08-01', '2023-10-15', '2023-10-10', '2023-10-20', 0, '2025-11-06 09:18:52'),
(2, '2023-2024', '7', '2nd Quarter', 'Quarter', '2023-10-16', '2023-12-20', '2023-12-15', '2023-12-25', 0, '2025-11-06 09:18:52'),
(3, '2023-2024', '7', '3rd Quarter', 'Quarter', '2024-01-06', '2024-03-21', '2024-03-16', '2024-03-26', 0, '2025-11-06 09:18:52'),
(4, '2023-2024', '7', '4th Quarter', 'Quarter', '2024-03-24', '2024-05-30', '2024-05-25', '2024-06-04', 0, '2025-11-06 09:18:52'),
(5, '2023-2024', '8', '1st Quarter', 'Quarter', '2023-08-01', '2023-10-15', '2023-10-10', '2023-10-20', 0, '2025-11-06 09:18:52'),
(6, '2023-2024', '8', '2nd Quarter', 'Quarter', '2023-10-16', '2023-12-20', '2023-12-15', '2023-12-25', 0, '2025-11-06 09:18:52'),
(7, '2023-2024', '8', '3rd Quarter', 'Quarter', '2024-01-06', '2024-03-21', '2024-03-16', '2024-03-26', 0, '2025-11-06 09:18:52'),
(8, '2023-2024', '8', '4th Quarter', 'Quarter', '2024-03-24', '2024-05-30', '2024-05-25', '2024-06-04', 0, '2025-11-06 09:18:52'),
(9, '2023-2024', '9', '1st Quarter', 'Quarter', '2023-08-01', '2023-10-15', '2023-10-10', '2023-10-20', 0, '2025-11-06 09:18:52'),
(10, '2023-2024', '9', '2nd Quarter', 'Quarter', '2023-10-16', '2023-12-20', '2023-12-15', '2023-12-25', 0, '2025-11-06 09:18:52'),
(11, '2023-2024', '9', '3rd Quarter', 'Quarter', '2024-01-06', '2024-03-21', '2024-03-16', '2024-03-26', 0, '2025-11-06 09:18:52'),
(12, '2023-2024', '9', '4th Quarter', 'Quarter', '2024-03-24', '2024-05-30', '2024-05-25', '2024-06-04', 0, '2025-11-06 09:18:52'),
(13, '2023-2024', '10', '1st Quarter', 'Quarter', '2023-08-01', '2023-10-15', '2023-10-10', '2023-10-20', 0, '2025-11-06 09:18:52'),
(14, '2023-2024', '10', '2nd Quarter', 'Quarter', '2023-10-16', '2023-12-20', '2023-12-15', '2023-12-25', 0, '2025-11-06 09:18:52'),
(15, '2023-2024', '10', '3rd Quarter', 'Quarter', '2024-01-06', '2024-03-21', '2024-03-16', '2024-03-26', 0, '2025-11-06 09:18:52'),
(16, '2023-2024', '10', '4th Quarter', 'Quarter', '2024-03-24', '2024-05-30', '2024-05-25', '2024-06-04', 0, '2025-11-06 09:18:52'),
(17, '2023-2024', '11', '1st Semester - Prelim', 'Semester', '2023-08-01', '2023-09-30', '2023-09-25', '2023-10-05', 0, '2025-11-06 09:18:52'),
(18, '2023-2024', '11', '1st Semester - Finals', 'Semester', '2023-10-01', '2023-11-30', '2023-11-25', '2023-12-05', 0, '2025-11-06 09:18:52'),
(19, '2023-2024', '11', '2nd Semester - Prelim', 'Semester', '2024-01-06', '2024-02-28', '2024-02-23', '2024-03-05', 0, '2025-11-06 09:18:52'),
(20, '2023-2024', '11', '2nd Semester - Finals', 'Semester', '2024-03-01', '2024-05-30', '2024-05-25', '2024-06-04', 0, '2025-11-06 09:18:52');

-- --------------------------------------------------------

--
-- Table structure for table `reattempt_requests`
--

CREATE TABLE `reattempt_requests` (
  `request_id` int(11) NOT NULL,
  `sub_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `section_id` int(11) NOT NULL,
  `section_name` varchar(50) NOT NULL,
  `teacher_id` varchar(20) NOT NULL,
  `school_year` varchar(9) NOT NULL,
  `period_id` int(11) NOT NULL,
  `grading_period` varchar(50) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('Pending','Approved','Rejected','Completed') DEFAULT 'Pending',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(20) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `school_years`
--

CREATE TABLE `school_years` (
  `school_year` varchar(9) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `school_years`
--

INSERT INTO `school_years` (`school_year`, `start_date`, `end_date`, `is_active`, `created_at`) VALUES
('2023-2024', '2023-08-01', '2024-05-31', 0, '2025-11-06 09:18:52'),
('2024-2025', '2024-08-01', '2025-05-30', 1, '2025-11-06 09:18:52');

-- --------------------------------------------------------

--
-- Table structure for table `section_info`
--

CREATE TABLE `section_info` (
  `section_id` int(11) NOT NULL,
  `section_name` varchar(50) NOT NULL,
  `yearlevel` varchar(20) NOT NULL,
  `school_year` varchar(9) NOT NULL DEFAULT '2024-2025',
  `adviser_id` varchar(20) DEFAULT NULL,
  `max_capacity` int(11) DEFAULT 50,
  `current_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section_info`
--

INSERT INTO `section_info` (`section_id`, `section_name`, `yearlevel`, `school_year`, `adviser_id`, `max_capacity`, `current_count`, `created_at`) VALUES
(1, 'IRIS', '7', '2024-2025', 'TID-003', 50, 1, '2025-11-06 09:18:52'),
(2, 'ROSE', '8', '2024-2025', 'TID-006', 50, 1, '2025-11-06 09:18:52'),
(3, 'LILY', '9', '2024-2025', 'TID-004', 50, 1, '2025-11-06 09:18:52'),
(4, 'TULIPS', '10', '2024-2025', 'TID-007', 50, 1, '2025-11-06 09:18:52'),
(5, 'VEGA', '11', '2024-2025', 'TID-005', 50, 1, '2025-11-06 09:18:52'),
(6, 'ORION', '12', '2024-2025', 'TID-008', 50, 1, '2025-11-06 09:18:52');

-- --------------------------------------------------------

--
-- Table structure for table `student_achievements`
--

CREATE TABLE `student_achievements` (
  `achievement_id` int(11) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `school_year` varchar(9) NOT NULL,
  `yearlevel` varchar(20) NOT NULL,
  `period_id` int(11) DEFAULT NULL,
  `grading_period` varchar(50) NOT NULL,
  `average` decimal(5,2) DEFAULT NULL,
  `achievement` varchar(50) DEFAULT '----',
  `total_subjects` int(11) DEFAULT 0,
  `graded_subjects` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_achievements`
--

INSERT INTO `student_achievements` (`achievement_id`, `user_id`, `school_year`, `yearlevel`, `period_id`, `grading_period`, `average`, `achievement`, `total_subjects`, `graded_subjects`, `created_at`) VALUES
(1, 'SID-001', '2023-2024', '7', 1, '1st Quarter', 95.00, 'With High Honors', 9, 9, '2025-11-06 09:18:52'),
(2, 'SID-001', '2023-2024', '7', 2, '2nd Quarter', 96.00, 'With High Honors', 9, 9, '2025-11-06 09:18:52'),
(3, 'SID-001', '2023-2024', '7', 3, '3rd Quarter', 97.00, 'With High Honors', 9, 9, '2025-11-06 09:18:52'),
(4, 'SID-001', '2023-2024', '7', 4, '4th Quarter', 98.00, 'With Highest Honors', 9, 9, '2025-11-06 09:18:52'),
(5, 'SID-002', '2023-2024', '8', 5, '1st Quarter', 91.11, 'With Honors', 9, 9, '2025-11-06 09:18:52'),
(6, 'SID-002', '2023-2024', '8', 6, '2nd Quarter', 92.56, 'With Honors', 9, 9, '2025-11-06 09:18:52'),
(7, 'SID-002', '2023-2024', '8', 7, '3rd Quarter', 94.33, 'With Honors', 9, 9, '2025-11-06 09:18:52'),
(8, 'SID-002', '2023-2024', '8', 8, '4th Quarter', 95.44, 'With High Honors', 9, 9, '2025-11-06 09:18:52'),
(9, 'SID-003', '2023-2024', '9', 9, '1st Quarter', 91.89, 'With Honors', 9, 9, '2025-11-06 09:18:52'),
(10, 'SID-003', '2023-2024', '9', 10, '2nd Quarter', 92.78, 'With Honors', 9, 9, '2025-11-06 09:18:52'),
(11, 'SID-003', '2023-2024', '9', 11, '3rd Quarter', 92.67, 'With Honors', 9, 9, '2025-11-06 09:18:52'),
(12, 'SID-003', '2023-2024', '9', 12, '4th Quarter', 93.33, 'With Honors', 9, 9, '2025-11-06 09:18:52'),
(13, 'SID-004', '2023-2024', '10', 13, '1st Quarter', 98.44, 'With Highest Honors', 9, 9, '2025-11-06 09:18:52'),
(14, 'SID-004', '2023-2024', '10', 14, '2nd Quarter', 99.33, 'With Highest Honors', 9, 9, '2025-11-06 09:18:52'),
(15, 'SID-004', '2023-2024', '10', 15, '3rd Quarter', 99.33, 'With Highest Honors', 9, 9, '2025-11-06 09:18:52'),
(16, 'SID-004', '2023-2024', '10', 16, '4th Quarter', 99.89, 'With Highest Honors', 9, 9, '2025-11-06 09:18:52'),
(17, 'SID-005', '2023-2024', '11', 17, '1st Semester - Prelim', 95.22, 'With High Honors', 9, 9, '2025-11-06 09:18:52'),
(18, 'SID-005', '2023-2024', '11', 18, '1st Semester - Finals', 96.22, 'With High Honors', 9, 9, '2025-11-06 09:18:52'),
(19, 'SID-005', '2023-2024', '11', NULL, '1st Semester Final', 95.72, 'With High Honors', 9, 9, '2025-11-06 09:18:52'),
(20, 'SID-005', '2023-2024', '11', 19, '2nd Semester - Prelim', 96.22, 'With High Honors', 9, 9, '2025-11-06 09:18:52'),
(21, 'SID-005', '2023-2024', '11', 20, '2nd Semester - Finals', 97.22, 'With High Honors', 9, 9, '2025-11-06 09:18:52'),
(22, 'SID-005', '2023-2024', '11', NULL, '2nd Semester Final', 96.72, 'With High Honors', 9, 9, '2025-11-06 09:18:52');

-- --------------------------------------------------------

--
-- Table structure for table `student_info`
--

CREATE TABLE `student_info` (
  `user_id` varchar(20) NOT NULL,
  `fname` varchar(50) NOT NULL,
  `lname` varchar(50) NOT NULL,
  `mname` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `yearlevel` varchar(20) NOT NULL,
  `section_name` varchar(50) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `strand` varchar(50) DEFAULT NULL,
  `position` enum('JHS','SHS') NOT NULL,
  `status_enroll` enum('Enrolled','Not Enrolled','Transferred','Dropped','Graduated') DEFAULT 'Enrolled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_info`
--

INSERT INTO `student_info` (`user_id`, `fname`, `lname`, `mname`, `email`, `gender`, `date_of_birth`, `yearlevel`, `section_name`, `section_id`, `strand`, `position`, `status_enroll`, `created_at`) VALUES
('SID-001', 'Juan', 'Dela Cruz', 'Santos', 'juansantos@gmail.com', 'Male', '2010-05-15', '8', 'ROSE', 2, NULL, 'JHS', 'Enrolled', '2025-11-06 09:18:52'),
('SID-002', 'Maria', 'Santos', 'Lopez', 'student002@mseuf.edu.ph', 'Female', '2009-08-20', '9', 'LILY', 3, NULL, 'JHS', 'Enrolled', '2025-11-06 09:18:52'),
('SID-003', 'Pedro', 'Reyes', 'Cruz', 'student003@mseuf.edu.ph', 'Male', '2008-11-10', '10', 'TULIPS', 4, NULL, 'JHS', 'Enrolled', '2025-11-06 09:18:52'),
('SID-004', 'Ana', 'Torres', 'Garcia', 'student004@mseuf.edu.ph', 'Female', '2007-03-25', '11', 'VEGA', 5, 'STEM', 'SHS', 'Enrolled', '2025-11-06 09:18:52'),
('SID-005', 'Carlos', 'Mendoza', 'Reyes', 'student005@mseuf.edu.ph', 'Male', '2006-07-18', '12', 'ORION', 6, 'ABM', 'SHS', 'Enrolled', '2025-11-06 09:18:52');

-- --------------------------------------------------------

--
-- Table structure for table `subject_info`
--

CREATE TABLE `subject_info` (
  `sub_code` varchar(20) NOT NULL,
  `sub_name` varchar(100) NOT NULL,
  `teacher_id` varchar(20) DEFAULT NULL,
  `yearlevel` varchar(20) NOT NULL,
  `school_year` varchar(9) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_info`
--

INSERT INTO `subject_info` (`sub_code`, `sub_name`, `teacher_id`, `yearlevel`, `school_year`, `created_at`) VALUES
('AP10', 'Araling Panlipunan 10', 'TID-001', '10', '2023-2024', '2025-11-06 09:18:52'),
('AP7', 'Araling Panlipunan 7', 'TID-001', '7', '2023-2024', '2025-11-06 09:18:52'),
('AP8', 'Araling Panlipunan 8', 'TID-001', '8', '2023-2024', '2025-11-06 09:18:52'),
('AP9', 'Araling Panlipunan 9', 'TID-001', '9', '2023-2024', '2025-11-06 09:18:52'),
('BASICCAL11', 'Basic Calculus', 'TID-002', '11', '2024-2025', '2025-11-06 09:18:52'),
('COMP10', 'Computer 10', 'TID-002', '10', '2024-2025', '2025-11-06 09:18:52'),
('COMP7', 'Computer 7', 'TID-002', '7', '2024-2025', '2025-11-06 09:18:52'),
('COMP8', 'Computer 8', 'TID-002', '8', '2024-2025', '2025-11-06 09:18:52'),
('COMP9', 'Computer 9', 'TID-002', '9', '2024-2025', '2025-11-06 09:18:52'),
('CONTLIT12', 'Contemporary Philippine Arts', 'TID-008', '12', '2023-2024', '2025-11-06 14:58:38'),
('EARTHSCI11', 'Earth and Life Science', 'TID-002', '11', '2024-2025', '2025-11-06 09:18:52'),
('EMPTECH11', 'Empowerment Technologies', 'TID-001', '11', '2023-2024', '2025-11-06 09:18:52'),
('ENG10', 'English 10', 'TID-001', '10', '2023-2024', '2025-11-06 09:18:52'),
('ENG7', 'English 7', 'TID-001', '7', '2023-2024', '2025-11-06 09:18:52'),
('ENG8', 'English 8', 'TID-006', '8', '2024-2025', '2025-11-06 09:18:52'),
('ENG9', 'English 9', 'TID-001', '9', '2023-2024', '2025-11-06 09:18:52'),
('ESP10', 'Edukasyon sa Pagpapakatao 10', 'TID-001', '10', '2023-2024', '2025-11-06 09:18:52'),
('ESP7', 'Edukasyon sa Pagpapakatao 7', 'TID-001', '7', '2023-2024', '2025-11-06 09:18:52'),
('ESP8', 'Edukasyon sa Pagpapakatao 8', 'TID-001', '8', '2023-2024', '2025-11-06 09:18:52'),
('ESP9', 'Edukasyon sa Pagpapakatao 9', 'TID-001', '9', '2023-2024', '2025-11-06 09:18:52'),
('FIL10', 'Filipino 10', 'TID-001', '10', '2023-2024', '2025-11-06 09:18:52'),
('FIL7', 'Filipino 7', 'TID-001', '7', '2023-2024', '2025-11-06 09:18:52'),
('FIL8', 'Filipino 8', 'TID-006', '8', '2024-2025', '2025-11-06 09:18:52'),
('FIL9', 'Filipino 9', 'TID-001', '9', '2023-2024', '2025-11-06 09:18:52'),
('GENCHEM1-11', 'General Chemistry 1', 'TID-002', '11', '2024-2025', '2025-11-06 09:18:52'),
('GENCHEM2-11', 'General Chemistry 2', 'TID-002', '11', '2024-2025', '2025-11-06 09:18:52'),
('GENMATH11', 'General Mathematics', 'TID-002', '11', '2024-2025', '2025-11-06 09:18:52'),
('KOMWIKA11', 'Komunikasyo at Pananaliksik', 'TID-001', '11', '2023-2024', '2025-11-06 09:18:52'),
('KOMWIKA12', 'Komunikasyon at Pananaliksik 12', 'TID-008', '12', '2023-2024', '2025-11-06 14:58:38'),
('MAPEH10', 'MAPEH 10', 'TID-002', '10', '2024-2025', '2025-11-06 09:18:52'),
('MAPEH7', 'MAPEH 7', 'TID-002', '7', '2024-2025', '2025-11-06 09:18:52'),
('MAPEH8', 'MAPEH 8', 'TID-002', '8', '2024-2025', '2025-11-06 09:18:52'),
('MAPEH9', 'MAPEH 9', 'TID-002', '9', '2024-2025', '2025-11-06 09:18:52'),
('MATH10', 'Mathematics 10', 'TID-007', '10', '2023-2024', '2025-11-06 09:18:52'),
('MATH7', 'Mathematics 7', 'TID-002', '7', '2024-2025', '2025-11-06 09:18:52'),
('MATH8', 'Mathematics 8', 'TID-002', '8', '2024-2025', '2025-11-06 09:18:52'),
('MATH9', 'Mathematics 9', 'TID-002', '9', '2024-2025', '2025-11-06 09:18:52'),
('MIL11', 'Media Information Literacy', 'TID-001', '11', '2023-2024', '2025-11-06 09:18:52'),
('ORALCOM11', 'Oral Communication', 'TID-001', '11', '2023-2024', '2025-11-06 09:18:52'),
('PAGBASA11', 'Pagbasa at Pagsuri', 'TID-008', '11', '2023-2024', '2025-11-06 09:18:52'),
('PE1-11', 'Physical Education 1', 'TID-002', '11', '2024-2025', '2025-11-06 09:18:52'),
('PE2-11', 'Physical Education 2', 'TID-002', '11', '2024-2025', '2025-11-06 09:18:52'),
('PERSDEV11', 'Personal Development', 'TID-008', '11', '2023-2024', '2025-11-06 09:18:52'),
('PHILO11', 'Introduction to Philosophy', 'TID-001', '11', '2023-2024', '2025-11-06 09:18:52'),
('PHYSCI11', 'Physical Science', 'TID-002', '11', '2024-2025', '2025-11-06 09:18:52'),
('PRECAL11', 'Pre-calculus', 'TID-002', '11', '2024-2025', '2025-11-06 09:18:52'),
('READWRITE11', 'Reading and Writing', 'TID-001', '11', '2023-2024', '2025-11-06 09:18:52'),
('SCI10', 'Science 10', 'TID-007', '10', '2023-2024', '2025-11-06 09:18:52'),
('SCI7', 'Science 7', 'TID-002', '7', '2024-2025', '2025-11-06 09:18:52'),
('SCI8', 'Science 8', 'TID-002', '8', '2024-2025', '2025-11-06 09:18:52'),
('SCI9', 'Science 9', 'TID-002', '9', '2024-2025', '2025-11-06 09:18:52'),
('STAT11', 'Statistics and Probability', 'TID-002', '11', '2024-2025', '2025-11-06 09:18:52'),
('TLE10', 'TLE 10', 'TID-002', '10', '2024-2025', '2025-11-06 09:18:52'),
('TLE7', 'TLE 7', 'TID-002', '7', '2024-2025', '2025-11-06 09:18:52'),
('TLE8', 'TLE 8', 'TID-002', '8', '2024-2025', '2025-11-06 09:18:52'),
('TLE9', 'TLE 9', 'TID-002', '9', '2024-2025', '2025-11-06 09:18:52');

-- --------------------------------------------------------

--
-- Table structure for table `subject_section_assignments`
--

CREATE TABLE `subject_section_assignments` (
  `id` int(11) NOT NULL,
  `sub_code` varchar(20) NOT NULL,
  `teacher_id` varchar(20) NOT NULL,
  `section_id` int(11) NOT NULL,
  `yearlevel` varchar(20) NOT NULL,
  `school_year` varchar(9) NOT NULL DEFAULT '2024-2025',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_section_assignments`
--

INSERT INTO `subject_section_assignments` (`id`, `sub_code`, `teacher_id`, `section_id`, `yearlevel`, `school_year`, `created_at`) VALUES
(1, 'FIL8', 'TID-006', 2, '8', '2024-2025', '2025-11-06 14:56:20'),
(2, 'ENG8', 'TID-006', 2, '8', '2024-2025', '2025-11-06 14:56:20'),
(3, 'MATH10', 'TID-007', 4, '10', '2024-2025', '2025-11-06 14:56:20'),
(4, 'SCI10', 'TID-007', 4, '10', '2024-2025', '2025-11-06 14:56:20'),
(5, 'PAGBASA11', 'TID-008', 5, '11', '2024-2025', '2025-11-06 14:56:20'),
(6, 'PERSDEV11', 'TID-008', 5, '11', '2024-2025', '2025-11-06 14:56:20'),
(7, 'KOMWIKA12', 'TID-008', 6, '12', '2024-2025', '2025-11-06 14:59:14'),
(8, 'CONTLIT12', 'TID-008', 6, '12', '2024-2025', '2025-11-06 14:59:14');

-- --------------------------------------------------------

--
-- Table structure for table `tblusers`
--

CREATE TABLE `tblusers` (
  `user_id` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `status` enum('active','inactive','archived') DEFAULT 'active',
  `role` enum('Student','Teacher','Adviser','Admin') NOT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblusers`
--

INSERT INTO `tblusers` (`user_id`, `password`, `email`, `status`, `role`, `last_login`, `created_at`, `updated_at`) VALUES
('ADM-001', '$2b$10$ptvH7bCT77rTW88Rkaw5fOo1KFqPHWkiH74ZABB247g7CINMimdae', 'admin@mseuf.edu.ph', 'active', 'Admin', '2025-11-13 11:10:40', '2025-11-06 09:18:52', '2025-11-13 11:10:40'),
('ADM-002', '$2b$10$vgBW7KYHYckcjZfrO3g2eu.nwhqQzVixKEjQhDglu1AJFveeLvu72', 'admin2@gmail.com', 'active', 'Admin', '2025-11-12 20:45:42', '2025-11-12 20:27:57', '2025-11-12 23:00:39'),
('SID-001', '$2b$10$pzZvC7ML9DMaVR6x0WxcZusLJFa7dIfE2XBOWUFxeeH0FpCK4L756', 'juansantos@gmail.com', 'active', 'Student', '2025-11-13 10:48:15', '2025-11-06 09:18:52', '2025-11-13 10:49:29'),
('SID-002', '$2b$10$B1YRvo1txdGWzFbT/yBdy.LyDLR6S66iwtDKv01UysNiu8kke/L4W', 'student002@mseuf.edu.ph', 'active', 'Student', '2025-11-12 21:05:57', '2025-11-06 09:18:52', '2025-11-12 21:05:57'),
('SID-003', '$2b$10$MAEQ2DdyE8lu0u1G6yOEYugCWW3OPPWyksi9i40D.pqwfCblB5o8S', 'student003@mseuf.edu.ph', 'active', 'Student', '2025-11-12 14:09:24', '2025-11-06 09:18:52', '2025-11-12 14:09:24'),
('SID-004', '$2b$10$m4liUs0T7X44FCBBNDSvuO1z99uQ/uSIEsEHSmEupD1KS9K7O3yoe', 'student004@mseuf.edu.ph', 'active', 'Student', NULL, '2025-11-06 09:18:52', '2025-11-06 10:36:06'),
('SID-005', '$2b$10$AK9QWVlBwBCYGy7EZJDliuKcDfZJOMU/wCQPAy82cUpLbZ3wAFLeu', 'student005@mseuf.edu.ph', 'active', 'Student', '2025-11-13 02:24:00', '2025-11-06 09:18:52', '2025-11-13 02:24:00'),
('TID-001', '$2b$10$GmPsqG/jA8zPhM.2I6x3f.xwAfcX98XgQaqkhYAeI7EGOIA/FT6V2', 'teacher001@mseuf.edu.ph', 'archived', 'Teacher', '2025-11-12 23:34:45', '2025-11-06 09:18:52', '2025-11-12 23:52:51'),
('TID-002', '$2b$10$btrmHKqpNs9.HU85jnPTVel6uQYsQbRRm0yiOGXK9BNS0pY2dnb1u', 'teacher002@mseuf.edu.ph', 'active', 'Teacher', '2025-11-13 07:31:43', '2025-11-06 09:18:52', '2025-11-13 07:31:43'),
('TID-003', '$2b$10$G5/hbVqT8byMuFdJiVf1M.fChoCcvTZOaqsCwMgGOx9yfuekm5H5W', 'teacher003@mseuf.edu.ph', 'active', 'Adviser', '2025-11-12 14:48:57', '2025-11-06 09:18:52', '2025-11-12 14:48:57'),
('TID-004', '$2b$10$E8eLwMYH65BCslhuIi4vPud4pKasds3VHVCykCNZXoaSVegWPZvzO', 'teacher004@mseuf.edu.ph', 'active', 'Adviser', '2025-11-07 13:36:57', '2025-11-06 09:18:52', '2025-11-07 13:36:57'),
('TID-005', '$2b$10$7oOPUoXDeRXGjmh5JD0sw.x410y/KEJRHszQvEmZErJNg73pV6n/2', 'teacher005@mseuf.edu.ph', 'active', 'Adviser', '2025-11-12 23:36:28', '2025-11-06 09:18:52', '2025-11-12 23:36:28'),
('TID-006', '$2b$10$7oOPUoXDeRXGjmh5JD0sw.x410y/KEJRHszQvEmZErJNg73pV6n/2', 'teacher6@mseuf.edu.ph', 'active', 'Adviser', '2025-11-13 10:52:34', '2025-11-06 14:52:21', '2025-11-13 10:52:34'),
('TID-007', '$2b$10$7oOPUoXDeRXGjmh5JD0sw.x410y/KEJRHszQvEmZErJNg73pV6n/2', 'teacher007@mseuf.edu.ph', 'active', 'Adviser', '2025-11-07 13:36:14', '2025-11-06 14:52:21', '2025-11-07 13:36:14'),
('TID-008', '$2b$10$7oOPUoXDeRXGjmh5JD0sw.x410y/KEJRHszQvEmZErJNg73pV6n/2', 'teacher008@mseuf.edu.ph', 'active', 'Adviser', '2025-11-13 09:34:37', '2025-11-06 14:52:21', '2025-11-13 09:34:37'),
('TID-009', '$2b$10$KxGbr/GoGqIU6SxEvfA9iOmKnWMIltoMTb40qZTxJnB8HMrYxDan6', 'teacher009@gmail.com', 'active', 'Teacher', NULL, '2025-11-12 20:30:42', '2025-11-12 20:32:49');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_info`
--

CREATE TABLE `teacher_info` (
  `user_id` varchar(20) NOT NULL,
  `fname` varchar(50) NOT NULL,
  `lname` varchar(50) NOT NULL,
  `mname` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `position` enum('Adviser','Subject Teacher','Head Teacher') NOT NULL,
  `qualification` varchar(100) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `employment_status` enum('Full-time','Part-time','Contract','Resigned') DEFAULT 'Full-time',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_info`
--

INSERT INTO `teacher_info` (`user_id`, `fname`, `lname`, `mname`, `email`, `position`, `qualification`, `hire_date`, `employment_status`, `created_at`) VALUES
('TID-001', 'Juan', 'Dela Cruz', 'Santos', 'teacher001@mseuf.edu.ph', 'Subject Teacher', NULL, NULL, 'Full-time', '2025-11-06 09:18:52'),
('TID-002', 'Maria', 'Reyes', 'Lopez', 'teacher002@mseuf.edu.ph', 'Subject Teacher', NULL, NULL, 'Full-time', '2025-11-06 09:18:52'),
('TID-003', 'Pedro', 'Santos', 'Cruz', 'teacher003@mseuf.edu.ph', 'Adviser', NULL, NULL, 'Full-time', '2025-11-06 09:18:52'),
('TID-004', 'Ana', 'Torres', 'Garcia', 'teacher004@mseuf.edu.ph', 'Adviser', NULL, NULL, 'Full-time', '2025-11-06 09:18:52'),
('TID-005', 'Carlos', 'Mendoza', 'Reyes', 'teacher005@mseuf.edu.ph', 'Adviser', NULL, NULL, 'Full-time', '2025-11-06 09:18:52'),
('TID-006', 'Rosa', 'Martinez', 'Ramos', 'teacher6@mseuf.edu.ph', 'Adviser', NULL, NULL, 'Full-time', '2025-11-06 14:52:52'),
('TID-007', 'Jose', 'Gonzales', 'Cruz', 'teacher007@mseuf.edu.ph', 'Adviser', NULL, NULL, 'Full-time', '2025-11-06 14:52:52'),
('TID-008', 'Linda', 'Fernandez', 'Santos', 'teacher008@mseuf.edu.ph', 'Adviser', NULL, NULL, 'Full-time', '2025-11-06 14:52:52'),
('TID-009', 'newteacher', 'newteacher', NULL, 'teacher009@gmail.com', 'Subject Teacher', NULL, NULL, 'Full-time', '2025-11-12 20:30:42');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_info`
--
ALTER TABLE `admin_info`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `grade_records`
--
ALTER TABLE `grade_records`
  ADD PRIMARY KEY (`grade_id`);

--
-- Indexes for table `grade_submissions`
--
ALTER TABLE `grade_submissions`
  ADD PRIMARY KEY (`submission_id`),
  ADD UNIQUE KEY `unique_submission` (`sub_code`,`section_id`,`teacher_id`,`school_year`,`period_id`);

--
-- Indexes for table `grading_periods`
--
ALTER TABLE `grading_periods`
  ADD PRIMARY KEY (`period_id`);

--
-- Indexes for table `reattempt_requests`
--
ALTER TABLE `reattempt_requests`
  ADD PRIMARY KEY (`request_id`);

--
-- Indexes for table `school_years`
--
ALTER TABLE `school_years`
  ADD PRIMARY KEY (`school_year`);

--
-- Indexes for table `section_info`
--
ALTER TABLE `section_info`
  ADD PRIMARY KEY (`section_id`),
  ADD UNIQUE KEY `unique_section` (`section_name`,`yearlevel`);

--
-- Indexes for table `student_achievements`
--
ALTER TABLE `student_achievements`
  ADD PRIMARY KEY (`achievement_id`),
  ADD UNIQUE KEY `unique_achievement` (`user_id`,`school_year`,`yearlevel`,`grading_period`);

--
-- Indexes for table `student_info`
--
ALTER TABLE `student_info`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `subject_info`
--
ALTER TABLE `subject_info`
  ADD PRIMARY KEY (`sub_code`,`school_year`);

--
-- Indexes for table `subject_section_assignments`
--
ALTER TABLE `subject_section_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`sub_code`,`teacher_id`,`section_id`);

--
-- Indexes for table `tblusers`
--
ALTER TABLE `tblusers`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `teacher_info`
--
ALTER TABLE `teacher_info`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `grade_records`
--
ALTER TABLE `grade_records`
  MODIFY `grade_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=181;

--
-- AUTO_INCREMENT for table `grade_submissions`
--
ALTER TABLE `grade_submissions`
  MODIFY `submission_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grading_periods`
--
ALTER TABLE `grading_periods`
  MODIFY `period_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `reattempt_requests`
--
ALTER TABLE `reattempt_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `section_info`
--
ALTER TABLE `section_info`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `student_achievements`
--
ALTER TABLE `student_achievements`
  MODIFY `achievement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `subject_section_assignments`
--
ALTER TABLE `subject_section_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
