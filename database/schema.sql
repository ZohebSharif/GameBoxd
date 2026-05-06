CREATE DATABASE IF NOT EXISTS gameboxd;
USE gameboxd;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL
);

CREATE TABLE games (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    steam_app_id INT UNIQUE,
    title VARCHAR(150) NOT NULL,
    creator VARCHAR(100) NOT NULL,
    cover_url VARCHAR(255),
    genre VARCHAR(50),
    platform VARCHAR(50),
    release_year INT,
    steam_last_modified INT,
    steam_review_score INT,
    steam_review_score_desc VARCHAR(100),
    steam_total_positive INT NOT NULL DEFAULT 0,
    steam_total_negative INT NOT NULL DEFAULT 0,
    steam_total_reviews INT NOT NULL DEFAULT 0,
    steam_synced_at DATETIME NULL
);

CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    review TEXT NOT NULL,
    review_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

CREATE TABLE ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    rating_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, game_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

CREATE TABLE lists (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE list_items (
    list_id INT NOT NULL,
    game_id INT NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (list_id, game_id),
    FOREIGN KEY (list_id) REFERENCES lists(list_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

CREATE TABLE favorites (
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    favorited_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, game_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

CREATE TABLE steam_reviews (
    steam_review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    recommendation_id VARCHAR(32) NOT NULL UNIQUE,
    author_steamid VARCHAR(32),
    review TEXT,
    language VARCHAR(20),
    voted_up BOOLEAN,
    votes_up INT NOT NULL DEFAULT 0,
    votes_funny INT NOT NULL DEFAULT 0,
    weighted_vote_score DECIMAL(10,8),
    steam_created_at DATETIME,
    steam_updated_at DATETIME,
    synced_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

CREATE TABLE steam_sync_runs (
    sync_run_id INT AUTO_INCREMENT PRIMARY KEY,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME NULL,
    status ENUM('running', 'success', 'failed') NOT NULL DEFAULT 'running',
    games_seen INT NOT NULL DEFAULT 0,
    games_imported INT NOT NULL DEFAULT 0,
    games_updated INT NOT NULL DEFAULT 0,
    reviews_imported INT NOT NULL DEFAULT 0,
    error_message TEXT
);
