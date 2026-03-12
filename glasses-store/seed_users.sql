-- SQL Script to seed 20 users in eyewear_db
USE glasses_store;

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `role`, `enabled`, `email_verified`, `created_at`) VALUES
(UUID(), 'testuser1@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 1', 'USER', 1, 1, NOW()),
(UUID(), 'testuser2@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 2', 'USER', 1, 1, NOW()),
(UUID(), 'testuser3@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 3', 'USER', 1, 1, NOW()),
(UUID(), 'testuser4@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 4', 'USER', 1, 1, NOW()),
(UUID(), 'testuser5@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test Admin 5', 'ADMIN', 1, 1, NOW()),
(UUID(), 'testuser6@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 6', 'USER', 1, 1, NOW()),
(UUID(), 'testuser7@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 7', 'USER', 1, 1, NOW()),
(UUID(), 'testuser8@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 8', 'USER', 1, 1, NOW()),
(UUID(), 'testuser9@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 9', 'USER', 1, 1, NOW()),
(UUID(), 'testuser10@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test Admin 10', 'ADMIN', 1, 1, NOW()),
(UUID(), 'testuser11@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 11', 'USER', 1, 1, NOW()),
(UUID(), 'testuser12@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 12', 'USER', 1, 1, NOW()),
(UUID(), 'testuser13@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 13', 'USER', 1, 1, NOW()),
(UUID(), 'testuser14@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 14', 'USER', 1, 1, NOW()),
(UUID(), 'testuser15@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test Admin 15', 'ADMIN', 1, 1, NOW()),
(UUID(), 'testuser16@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 16', 'USER', 1, 1, NOW()),
(UUID(), 'testuser17@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 17', 'USER', 1, 1, NOW()),
(UUID(), 'testuser18@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 18', 'USER', 1, 1, NOW()),
(UUID(), 'testuser19@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test User 19', 'USER', 1, 1, NOW()),
(UUID(), 'testuser20@example.com', '$2a$10$EAOqCPtaMfoMFNXB1WomeuKcqk34SzfiOBSziCFxYTCERxckyiM86', 'Test Admin 20', 'ADMIN', 1, 1, NOW());
