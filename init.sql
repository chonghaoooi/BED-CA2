-- ============================================================
-- BED-CA2 Database Init SQL
-- Run this in Aiven MySQL console
--
-- NOTE: Replace BCRYPT_HASH_HERE with a real bcrypt hash.
-- Generate one by running this in your terminal:
--   node -e "require('bcrypt').hash('1234',10,(e,h)=>console.log(h))"
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS UserEnding;
DROP TABLE IF EXISTS Ending;
DROP TABLE IF EXISTS UserAccusation;
DROP TABLE IF EXISTS Suspect;
DROP TABLE IF EXISTS UserInventory;
DROP TABLE IF EXISTS Item;
DROP TABLE IF EXISTS UserCompletion;
DROP TABLE IF EXISTS userCompletion;
DROP TABLE IF EXISTS WellnessChallenge;
DROP TABLE IF EXISTS wellnessChallenge;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS Userlogin;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Userlogin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE User (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  points INT DEFAULT 0,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE WellnessChallenge (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL
);

CREATE TABLE UserCompletion (
  completion_id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_id INT NOT NULL,
  user_id INT NOT NULL,
  details TEXT,
  FOREIGN KEY (challenge_id) REFERENCES WellnessChallenge(challenge_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE Item (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  clue_name VARCHAR(255) NOT NULL,
  clue_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(512) DEFAULT NULL
);

CREATE TABLE UserInventory (
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  obtained_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id),
  FOREIGN KEY (item_id) REFERENCES Item(item_id)
);

CREATE TABLE Suspect (
  suspect_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),
  bio TEXT,
  alibi TEXT,
  status VARCHAR(50) DEFAULT 'Unknown',
  image_url VARCHAR(512) DEFAULT NULL
);

CREATE TABLE UserAccusation (
  user_id INT NOT NULL PRIMARY KEY,
  suspect_id INT NOT NULL,
  accused_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(user_id),
  FOREIGN KEY (suspect_id) REFERENCES Suspect(suspect_id)
);

CREATE TABLE Ending (
  ending_id INT AUTO_INCREMENT PRIMARY KEY,
  suspect_id INT NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  is_true_culprit BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (suspect_id) REFERENCES Suspect(suspect_id)
);

CREATE TABLE UserEnding (
  user_id INT NOT NULL,
  ending_id INT NOT NULL,
  obtained_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, ending_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id),
  FOREIGN KEY (ending_id) REFERENCES Ending(ending_id)
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO User (username, points) VALUES
('admin', 0),
('James', 1000),
('Jacob', 1200),
('SuperSOC', 3000),
('Chalres', 2700),
('Gaia', 10),
('Zues', 20),
('Thomas', 50),
('Jane', 30),
('Baksa', 70),
('kealn', 500),
('Shaun', 750);

-- All users have password: 1234
INSERT INTO Userlogin (username, email, password) VALUES
('admin', 'a@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('James', 'James@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('Jacob', 'Jacob@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('SuperSOC', 'SuperSOC@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('Chalres', 'Chalres@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('Gaia', 'Gaia@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('Zues', 'Zues@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('Thomas', 'Thomas@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('Jane', 'Jane@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('Baksa', 'Baksa@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('kealn', 'kealn@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm'),
('Shaun', 'Shaun@a.com', '$2b$10$HO.FoYgXLDZyG7RqLZ/PbufRdYUvF5mKDUcMgI5toaaJ.L0OIkXqm');

INSERT INTO WellnessChallenge (challenge_id, creator_id, description, points) VALUES
  (1, 1, 'Sleep like a boss - Get 7+ hours of sleep', 10),
  (2, 1, 'Stairs over elevator? Respect. - Take the stairs today', 20),
  (3, 2, 'Digital detox (mini edition) - No phone for 1 hour', 10),
  (4, 2, 'Touch grass IRL - Take a 15-minute walk outside', 10),
  (5, 2, 'IRL > DMs - Talk to a friend face-to-face', 20),
  (6, 3, 'Declutter your chaos - Clean your desk or room', 20),
  (7, 3, 'Help a homie - Assist someone without being asked', 20);

INSERT INTO Item (item_id, clue_name, clue_type, description, image_url) VALUES
  (1, 'Bloodstained Matchbook', 'Object', 'A matchbook from ''The Blue Orchid'' lounge, found under Victor Ashford''s desk. Dried blood on the striker. The victim was last seen at the Blue Orchid the night he died. Forensics matched the blood to Ashford—someone used this after the killing.', 'images/BlueOrchid.png'),
  (2, 'Torn Receipt Fragment', 'Document', 'Half a receipt from the Ashford Manor gatehouse, date the night of the murder. Partial surname visible: ''...KLINE''. The gate log was altered; this scrap was recovered from the shredder. Someone with access to the estate signed in under a clipped name.', 'images/tornReceipt.png'),
  (3, 'Witness Statement: Night Guard', 'Testimony', 'I saw a figure leave the east wing at 2:13 AM. Walk had a slight limp, like an old injury. Wore a long coat. Didn''t see the face. — The night guard''s account places someone at the scene. The limp matches a known old fracture in one suspect''s file.', 'images/figure.png'),
  (4, 'Security Photo #17', 'Photo', 'Blurry still from the manor''s east-wing camera. A coat with a distinctive silver pin on the lapel—medical or academic insignia. The morgue and the university use similar pins; only one person on the suspect list has both access and that pin.', 'images/coat.png'),
  (5, 'Lab Log Discrepancy', 'Document', 'The forensic lab log for Ashford''s samples shows a gap and a later overwrite. The pathologist who signed off—Dr. Selene Kline—was on duty that night. Her alibi was ''reviewing samples at the morgue.'' The timestamps don''t match; she had time to leave, then alter the log.', 'images/cipher.png');

INSERT INTO UserInventory (user_id, item_id, obtained_at) VALUES
(1, 3, '2026-02-02 14:07:00'),
(2, 3, '2026-02-02 13:52:00'),
(3, 3, '2026-02-02 14:01:00'),
(4, 3, '2026-02-02 13:41:00'),
(5, 3, '2026-02-02 13:55:00'),
(6, 3, '2026-02-02 13:30:00'),
(7, 3, '2026-02-02 13:46:00'),
(8, 3, '2026-02-02 13:58:00'),
(9, 3, '2026-02-02 13:36:00'),
(10, 3, '2026-02-02 13:49:00');

INSERT INTO Suspect (suspect_id, name, alias, bio, alibi, status, image_url) VALUES
  (1, 'Evelyn Harrow', 'The Archivist', 'City records clerk with access to sealed case files. She had reason to dislike Victor Ashford—he had pressured the city to bury an old inquiry that involved her late brother. She was in the building that night organising archives; her keycard shows activity until midnight. No witness puts her in the east wing.', 'Cataloguing documents until midnight.', 'Person of Interest', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'),
  (2, 'Marcus Venn', NULL, 'Private security contractor recently fired from Ashford''s estate. He blamed Victor for ruining his reputation and had been heard threatening him. His alibi is a late shift at a warehouse across town, but the time sheets were filled by a mate; no one actually saw him there at 2 AM.', 'Late shift across town.', 'Unknown', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
  (3, 'Dr. Selene Kline', 'Kline', 'Forensic pathologist who worked the original Ashford case years ago—the one that was covered up. She had the training, the access to the manor (as an expert consultant), and the silver pin from the medical college. Her alibi was reviewing samples at the morgue, but the lab log shows a gap that night. She also had the limp: an old fracture from a car accident, documented in her file.', 'At the morgue reviewing samples.', 'Unknown', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'),
  (4, 'Noah Pike', 'Pike', 'Street photographer who sells crime-scene shots to the press. He was outside the manor the night of the murder trying to get a scoop; his presence is on the gate camera. He had no motive to kill Ashford—he made money from the aftermath. The silver pin in the security still doesn''t match his usual dress.', 'Developing photos in a darkroom.', 'Unknown', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'),
  (5, 'Iris Calder', 'C.C.', 'Antique dealer with ties to the Ashford family. She had strange debts and had sold Victor a rare item he used as leverage in the old case. She claims she hosted a private buyer all evening; the buyer''s name checks out but the timing is fuzzy. No physical evidence ties her to the east wing.', 'Hosted a private buyer all evening.', 'Unknown', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');

INSERT INTO UserAccusation (user_id, suspect_id, accused_at) VALUES
(1, 1, '2026-02-02 14:29:10'),
(2, 2, '2026-02-02 14:21:45'),
(3, 3, '2026-02-02 14:26:30'),
(4, 4, '2026-02-02 14:18:05'),
(5, 5, '2026-02-02 14:24:50'),
(6, 1, '2026-02-02 14:30:00'),
(7, 2, '2026-02-02 14:20:40'),
(8, 3, '2026-02-02 14:27:15'),
(9, 4, '2026-02-02 14:16:55'),
(10, 5, '2026-02-02 14:23:30');

INSERT INTO Ending (suspect_id, title, description, is_true_culprit) VALUES
  (1, 'Sealed in the Stacks', 'Evelyn''s files reveal tampered evidence—she vanishes before trial. The case remains officially ''solved'', but the pattern continues.', 0),
  (2, 'The Wrong Collar', 'Marcus is jailed, but the real culprit exploits the chaos. New victims appear with the same signature, mocking your conclusion.', 0),
  (3, 'Cold Truth', 'Selene''s alibi collapses under lab logs. A hidden ledger ties her to the cover-up—and the killings stop overnight.', 1),
  (4, 'Flashbulb Fallout', 'Noah confesses to staging scenes for photos, not murder. You close the case, but public trust in the department shatters.', 0),
  (5, 'The Collector''s Pact', 'Iris is convicted on circumstantial clues. Later, a rare item surfaces proving she was framed—too late to undo the sentence.', 0);

INSERT INTO UserEnding (user_id, ending_id, obtained_at) VALUES
(1, 1, '2026-02-02 14:29:10'),
(2, 2, '2026-02-02 14:21:45'),
(3, 3, '2026-02-02 14:26:30'),
(4, 4, '2026-02-02 14:18:05'),
(5, 5, '2026-02-02 14:24:50'),
(6, 1, '2026-02-02 14:30:00'),
(7, 2, '2026-02-02 14:20:40'),
(8, 3, '2026-02-02 14:27:15'),
(9, 4, '2026-02-02 14:16:55'),
(10, 5, '2026-02-02 14:23:30');
