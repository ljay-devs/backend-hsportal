-- Fix for reattempt_requests table: Add AUTO_INCREMENT to request_id
-- Run this SQL script on your database to fix the "Field 'request_id' doesn't have a default value" error

USE `dbhighschoolportal`;

-- Add AUTO_INCREMENT to the request_id field
ALTER TABLE `reattempt_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

-- Verify the change
DESCRIBE `reattempt_requests`;
