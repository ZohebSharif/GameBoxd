USE gameboxd;

-- =====================
-- USERS (5 users, all passwords are "password123")
-- =====================
INSERT INTO users (username, email, password_hash, created_at, last_login) VALUES
('alexgamer',    'alex.gamer@email.com',    '$2b$10$rQZKlL5pG2FLz4k8hVGKxuPJYGZHNJMBqOKJ5p1e3Y6OcVfxHhKCm', '2024-01-15 10:30:00', '2025-04-18 21:45:00'),
('samira_plays', 'samira.plays@email.com',  '$2b$10$rQZKlL5pG2FLz4k8hVGKxuPJYGZHNJMBqOKJ5p1e3Y6OcVfxHhKCm', '2024-02-20 14:00:00', '2025-04-17 18:30:00'),
('pixel_knight', 'pixel.knight@email.com',  '$2b$10$rQZKlL5pG2FLz4k8hVGKxuPJYGZHNJMBqOKJ5p1e3Y6OcVfxHhKCm', '2024-03-10 08:15:00', '2025-04-19 09:00:00'),
('novaquest',    'nova.quest@email.com',    '$2b$10$rQZKlL5pG2FLz4k8hVGKxuPJYGZHNJMBqOKJ5p1e3Y6OcVfxHhKCm', '2024-05-01 16:45:00', '2025-04-15 22:10:00'),
('retro_jay',    'retro.jay@email.com',     '$2b$10$rQZKlL5pG2FLz4k8hVGKxuPJYGZHNJMBqOKJ5p1e3Y6OcVfxHhKCm', '2024-06-12 11:20:00', '2025-04-16 14:55:00');

-- =====================
-- GAMES (12 games)
-- =====================
INSERT INTO games (title, creator, cover_url, genre, platform, release_year) VALUES
('The Legend of Zelda: Breath of the Wild', 'Nintendo',           'https://placehold.co/300x400?text=Zelda%20BOTW',          'Action-Adventure', 'Nintendo Switch', 2017),
('Elden Ring',                              'FromSoftware',       'https://placehold.co/300x400?text=Elden%20Ring',           'Action RPG',       'Multi-platform',  2022),
('Red Dead Redemption 2',                   'Rockstar Games',     'https://placehold.co/300x400?text=Red%20Dead%202',         'Action-Adventure', 'Multi-platform',  2018),
('The Witcher 3: Wild Hunt',                'CD Projekt Red',     'https://placehold.co/300x400?text=Witcher%203',            'RPG',              'Multi-platform',  2015),
('God of War Ragnarök',                     'Santa Monica Studio','https://placehold.co/300x400?text=GoW%20Ragnarok',         'Action-Adventure', 'PlayStation',      2022),
('Hades',                                   'Supergiant Games',   'https://placehold.co/300x400?text=Hades',                  'Roguelike',        'Multi-platform',  2020),
('Celeste',                                 'Maddy Makes Games',  'https://placehold.co/300x400?text=Celeste',                'Platformer',       'Multi-platform',  2018),
('Hollow Knight',                           'Team Cherry',        'https://placehold.co/300x400?text=Hollow%20Knight',        'Metroidvania',     'Multi-platform',  2017),
('Stardew Valley',                          'ConcernedApe',       'https://placehold.co/300x400?text=Stardew%20Valley',       'Simulation',       'Multi-platform',  2016),
('Minecraft',                               'Mojang Studios',     'https://placehold.co/300x400?text=Minecraft',              'Sandbox',          'Multi-platform',  2011),
('Dark Souls III',                          'FromSoftware',       'https://placehold.co/300x400?text=Dark%20Souls%20III',     'Action RPG',       'Multi-platform',  2016),
('Portal 2',                                'Valve',              'https://placehold.co/300x400?text=Portal%202',             'Puzzle',           'Multi-platform',  2011);

-- =====================
-- REVIEWS (18 reviews)
-- =====================
INSERT INTO reviews (user_id, game_id, review, review_date) VALUES
(1, 1, 'An absolute masterpiece. The open world feels alive, and the freedom to explore Hyrule at your own pace is unmatched. Every mountain hides a secret worth finding.', '2024-03-01 12:00:00'),
(1, 2, 'Elden Ring blends the best of Souls combat with an awe-inspiring open world. The bosses are punishing but fair. Easily one of the best games of the decade.', '2024-03-15 14:30:00'),
(1, 6, 'Hades redefines the roguelike genre. The narrative integration into the gameplay loop is genius—every death pushes the story forward.', '2024-04-10 09:00:00'),
(2, 3, 'Red Dead Redemption 2 is less a game and more an experience. Arthur Morgan''s story is one of the most emotionally devastating journeys in gaming.', '2024-04-01 16:00:00'),
(2, 4, 'The Witcher 3 set the gold standard for RPGs. The writing, the world, the side quests—everything feels handcrafted with love.', '2024-04-05 11:00:00'),
(2, 7, 'Celeste is a beautiful and brutally challenging platformer. Its story about anxiety and self-acceptance is told with such sincerity it brought me to tears.', '2024-04-20 18:30:00'),
(2, 9, 'Stardew Valley is the perfect comfort game. Farming, fishing, friendships—it''s a cozy escape I keep coming back to year after year.', '2024-05-01 20:00:00'),
(3, 1, 'Breath of the Wild changed what I expect from open-world games. The physics engine alone is a playground of creativity.', '2024-05-10 10:00:00'),
(3, 5, 'God of War Ragnarök delivers on every front. The father-son dynamic, the combat, the spectacle—it''s a worthy sequel to the 2018 masterpiece.', '2024-05-15 13:00:00'),
(3, 8, 'Hollow Knight offers an incredibly atmospheric Metroidvania experience. The art, the music, the lore—all exceptional. A must-play for fans of the genre.', '2024-05-20 15:45:00'),
(3, 11, 'Dark Souls III is a relentless gauntlet of precision combat. The Abyss Watchers and Nameless King remain some of the most thrilling boss encounters ever designed.', '2024-06-01 17:00:00'),
(4, 2, 'Elden Ring overwhelmed me at first, but once it clicked, I couldn''t stop exploring. The sense of discovery is phenomenal.', '2024-06-10 08:30:00'),
(4, 10, 'Minecraft is limitless creativity in a block-shaped package. After over a decade, it still sparks imagination like nothing else.', '2024-06-15 19:00:00'),
(4, 12, 'Portal 2 is one of the wittiest and most cleverly designed puzzle games ever made. GLaDOS and Wheatley steal every scene.', '2024-06-20 21:00:00'),
(4, 6, 'Hades has the tightest combat loop I''ve experienced. Pair that with Supergiant''s signature art and music, and you get something truly special.', '2024-07-01 10:30:00'),
(5, 3, 'The attention to detail in RDR2 is staggering. I spent hours just riding through the countryside watching the sunset. A genuine work of art.', '2024-07-10 14:00:00'),
(5, 9, 'Stardew Valley is deceptively deep. What starts as casual farming quickly becomes an obsessive min-maxing session. Love every second of it.', '2024-07-15 16:30:00'),
(5, 12, 'Portal 2''s co-op mode is the best cooperative puzzle experience out there. The humor alone is worth the price of admission.', '2024-07-20 22:00:00');

-- =====================
-- RATINGS (25 ratings)
-- =====================
INSERT INTO ratings (user_id, game_id, rating, rating_date) VALUES
(1, 1,  5.0, '2024-03-01 12:05:00'),
(1, 2,  4.5, '2024-03-15 14:35:00'),
(1, 3,  4.0, '2024-03-20 10:00:00'),
(1, 6,  5.0, '2024-04-10 09:05:00'),
(1, 8,  4.0, '2024-04-12 11:00:00'),
(2, 3,  5.0, '2024-04-01 16:05:00'),
(2, 4,  5.0, '2024-04-05 11:05:00'),
(2, 7,  4.5, '2024-04-20 18:35:00'),
(2, 9,  4.5, '2024-05-01 20:05:00'),
(2, 1,  4.5, '2024-05-05 09:00:00'),
(3, 1,  5.0, '2024-05-10 10:05:00'),
(3, 5,  4.5, '2024-05-15 13:05:00'),
(3, 8,  5.0, '2024-05-20 15:50:00'),
(3, 11, 4.0, '2024-06-01 17:05:00'),
(3, 6,  4.5, '2024-06-05 12:00:00'),
(4, 2,  4.0, '2024-06-10 08:35:00'),
(4, 10, 4.5, '2024-06-15 19:05:00'),
(4, 12, 5.0, '2024-06-20 21:05:00'),
(4, 6,  5.0, '2024-07-01 10:35:00'),
(4, 9,  4.0, '2024-07-05 14:00:00'),
(5, 3,  5.0, '2024-07-10 14:05:00'),
(5, 9,  4.5, '2024-07-15 16:35:00'),
(5, 12, 4.5, '2024-07-20 22:05:00'),
(5, 1,  4.0, '2024-07-25 10:00:00'),
(5, 11, 3.5, '2024-07-30 18:00:00');

-- =====================
-- LISTS (4 lists)
-- =====================
INSERT INTO lists (user_id, name, created_at) VALUES
(1, 'All-Time Favorites',          '2024-03-02 08:00:00'),
(2, 'Cozy Games for Rainy Days',   '2024-04-10 12:00:00'),
(3, 'Soulslike Gauntlet',          '2024-05-25 09:30:00'),
(5, 'Best Stories in Gaming',      '2024-07-12 15:00:00');

-- =====================
-- LIST ITEMS (12 items)
-- =====================
INSERT INTO list_items (list_id, game_id, added_at) VALUES
(1, 1,  '2024-03-02 08:05:00'),
(1, 2,  '2024-03-02 08:06:00'),
(1, 6,  '2024-04-10 09:10:00'),
(2, 9,  '2024-04-10 12:05:00'),
(2, 7,  '2024-04-10 12:06:00'),
(2, 10, '2024-04-10 12:07:00'),
(3, 2,  '2024-05-25 09:35:00'),
(3, 11, '2024-05-25 09:36:00'),
(3, 8,  '2024-05-25 09:37:00'),
(4, 3,  '2024-07-12 15:05:00'),
(4, 4,  '2024-07-12 15:06:00'),
(4, 5,  '2024-07-12 15:07:00');

-- =====================
-- FAVORITES (13 favorites)
-- =====================
INSERT INTO favorites (user_id, game_id, favorited_at) VALUES
(1, 1,  '2024-03-01 12:10:00'),
(1, 6,  '2024-04-10 09:10:00'),
(1, 2,  '2024-03-15 14:40:00'),
(2, 4,  '2024-04-05 11:10:00'),
(2, 9,  '2024-05-01 20:10:00'),
(2, 3,  '2024-04-01 16:10:00'),
(3, 8,  '2024-05-20 15:55:00'),
(3, 1,  '2024-05-10 10:10:00'),
(3, 5,  '2024-05-15 13:10:00'),
(4, 12, '2024-06-20 21:10:00'),
(4, 6,  '2024-07-01 10:40:00'),
(5, 3,  '2024-07-10 14:10:00'),
(5, 9,  '2024-07-15 16:40:00');
