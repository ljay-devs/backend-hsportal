-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2025 at 01:42 PM
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
('ADM-002', '$2b$10$vgBW7KYHYckcjZfrO3g2eu.nwhqQzVixKEjQhDglu1AJFveeLvu72', 'admin2@gmail.com', 'active', 'Admin', '2025-11-12 20:45:42', '2025-11-12 20:27:57', '2025-11-12 23:00:39');

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
  MODIFY `grade_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grade_submissions`
--
ALTER TABLE `grade_submissions`
  MODIFY `submission_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grading_periods`
--
ALTER TABLE `grading_periods`
  MODIFY `period_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reattempt_requests`
--
ALTER TABLE `reattempt_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `section_info`
--
ALTER TABLE `section_info`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_achievements`
--
ALTER TABLE `student_achievements`
  MODIFY `achievement_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subject_section_assignments`
--
ALTER TABLE `subject_section_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
