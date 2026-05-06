import 'dotenv/config';
import pool from '../db.js';

const PUBLIC_APP_LIST_URL = 'https://api.steampowered.com/ISteamApps/GetAppList/v2/?format=json';
const STORE_APP_LIST_URL = 'https://partner.steam-api.com/IStoreService/GetAppList/v1/';
const STORE_DETAILS_URL = 'https://store.steampowered.com/api/appdetails';
const STORE_REVIEWS_BASE = 'https://store.steampowered.com/appreviews';
const STORE_SEARCH_URL = 'https://store.steampowered.com/search/results/';

const DEFAULT_LIMIT = 25;
const DEFAULT_REVIEW_LIMIT = 20;
const DEFAULT_DELAY_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function optionValue(name, fallback = undefined) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  if (arg) return arg.slice(prefix.length);
  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function numberOption(name, fallback) {
  const raw = optionValue(name);
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`--${name} must be a non-negative number`);
  }
  return parsed;
}

function listOption(name, fallback = '') {
  return optionValue(name, fallback)
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);
}

function firstValue(values, fallback = null) {
  return Array.isArray(values) && values.length > 0 ? values[0] : fallback;
}

function normalizePlatforms(platforms = {}) {
  const labels = [];
  if (platforms.windows) labels.push('Windows');
  if (platforms.mac) labels.push('Mac');
  if (platforms.linux) labels.push('Linux');
  return labels.length ? labels.join(', ') : null;
}

function extractReleaseYear(releaseDate = {}) {
  if (!releaseDate.date) return null;
  const match = releaseDate.date.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function toDateFromUnix(timestamp) {
  return timestamp ? new Date(timestamp * 1000) : null;
}

function weightedScore(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'GameBoxd Steam sync (educational project)',
    },
  });
  if (!res.ok) {
    throw new Error(`Steam request failed ${res.status} ${res.statusText}: ${url}`);
  }
  return res.json();
}

async function getStoreSearchApps(limit) {
  const apps = [];
  const seen = new Set();
  const pageSize = 50;
  let start = 0;

  while (!limit || apps.length < limit) {
    const url = new URL(STORE_SEARCH_URL);
    url.searchParams.set('query', '');
    url.searchParams.set('start', String(start));
    url.searchParams.set('count', String(Math.min(pageSize, limit ? limit - apps.length : pageSize)));
    url.searchParams.set('dynamic_data', '');
    url.searchParams.set('force_infinite', '1');
    url.searchParams.set('category1', '998');
    url.searchParams.set('snr', '1_7_7_7000_7');
    url.searchParams.set('infinite', '1');

    const data = await fetchJson(url);
    const html = data.results_html || '';
    const matches = [...html.matchAll(/data-ds-appid="(\d+)"/g)];
    if (matches.length === 0) break;

    for (const match of matches) {
      const appid = Number(match[1]);
      if (!seen.has(appid)) {
        seen.add(appid);
        apps.push({ appid, name: null, last_modified: null });
      }
      if (limit && apps.length >= limit) break;
    }

    start += pageSize;
    if (start >= Number(data.total_count || 0)) break;
  }

  return apps;
}

async function ensureSteamSchema() {
  const [columns] = await pool.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'games'`
  );
  const existing = new Set(columns.map((column) => column.COLUMN_NAME));
  const additions = [
    ['steam_app_id', 'INT UNIQUE'],
    ['steam_last_modified', 'INT'],
    ['steam_review_score', 'INT'],
    ['steam_review_score_desc', 'VARCHAR(100)'],
    ['steam_total_positive', 'INT NOT NULL DEFAULT 0'],
    ['steam_total_negative', 'INT NOT NULL DEFAULT 0'],
    ['steam_total_reviews', 'INT NOT NULL DEFAULT 0'],
    ['steam_synced_at', 'DATETIME NULL'],
  ];

  for (const [name, definition] of additions) {
    if (!existing.has(name)) {
      await pool.execute(`ALTER TABLE games ADD COLUMN ${name} ${definition}`);
    }
  }

  await pool.execute(
    `CREATE TABLE IF NOT EXISTS steam_reviews (
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
    )`
  );

  await pool.execute(
    `CREATE TABLE IF NOT EXISTS steam_sync_runs (
      sync_run_id INT AUTO_INCREMENT PRIMARY KEY,
      started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      finished_at DATETIME NULL,
      status ENUM('running', 'success', 'failed') NOT NULL DEFAULT 'running',
      games_seen INT NOT NULL DEFAULT 0,
      games_imported INT NOT NULL DEFAULT 0,
      games_updated INT NOT NULL DEFAULT 0,
      reviews_imported INT NOT NULL DEFAULT 0,
      error_message TEXT
    )`
  );
}

async function createSyncRun() {
  const [result] = await pool.execute('INSERT INTO steam_sync_runs () VALUES ()');
  return result.insertId;
}

async function finishSyncRun(syncRunId, status, stats, errorMessage = null) {
  await pool.execute(
    `UPDATE steam_sync_runs
     SET finished_at = NOW(), status = ?, games_seen = ?, games_imported = ?,
         games_updated = ?, reviews_imported = ?, error_message = ?
     WHERE sync_run_id = ?`,
    [
      status,
      stats.gamesSeen,
      stats.gamesImported,
      stats.gamesUpdated,
      stats.reviewsImported,
      errorMessage,
      syncRunId,
    ]
  );
}

async function getCandidateApps({ appIds, apiKey, limit }) {
  if (appIds.length > 0) {
    return appIds.map((appid) => ({ appid, name: null, last_modified: null }));
  }

  if (apiKey) {
    const apps = [];
    let lastAppid = 0;

    while (!limit || apps.length < limit) {
      const maxResults = limit ? Math.min(limit - apps.length, 50000) : 50000;
      const input = {
        include_games: true,
        include_dlc: false,
        include_software: false,
        include_videos: false,
        include_hardware: false,
        max_results: maxResults,
      };
      if (lastAppid > 0) {
        input.last_appid = lastAppid;
      }

      const url = new URL(STORE_APP_LIST_URL);
      url.searchParams.set('key', apiKey);
      url.searchParams.set('input_json', JSON.stringify(input));

      const data = await fetchJson(url);
      const page = data.response?.apps || [];
      if (page.length === 0) break;

      apps.push(...page);
      lastAppid = page[page.length - 1].appid;
      if (page.length < maxResults) break;
    }

    return apps;
  }

  try {
    const data = await fetchJson(PUBLIC_APP_LIST_URL);
    const apps = data.applist?.apps || [];
    const namedApps = apps.filter((app) => app.name && app.appid);
    return limit ? namedApps.slice(0, limit) : namedApps;
  } catch (err) {
    console.warn(`Steam public app list unavailable (${err.message}); using Steam Store search fallback.`);
    return getStoreSearchApps(limit);
  }
}

async function getAppDetails(appid) {
  const url = new URL(STORE_DETAILS_URL);
  url.searchParams.set('appids', String(appid));
  url.searchParams.set('cc', 'US');
  url.searchParams.set('l', 'english');

  const data = await fetchJson(url);
  const payload = data[String(appid)];
  if (!payload?.success || payload.data?.type !== 'game') {
    return null;
  }
  return payload.data;
}

async function upsertGame(app, appListItem) {
  const title = app.name || appListItem.name;
  if (!title) return null;

  const creator = firstValue(app.developers) || firstValue(app.publishers) || 'Unknown';
  const genre = firstValue(app.genres)?.description || null;
  const platform = normalizePlatforms(app.platforms);
  const releaseYear = extractReleaseYear(app.release_date);
  const coverUrl = app.header_image || app.capsule_image || null;
  const steamAppId = app.steam_appid || appListItem.appid;

  const [existing] = await pool.execute(
    `SELECT game_id, steam_app_id FROM games
     WHERE steam_app_id = ? OR (steam_app_id IS NULL AND title = ?)
     ORDER BY steam_app_id IS NULL
     LIMIT 1`,
    [steamAppId, title]
  );

  if (existing.length > 0) {
    await pool.execute(
      `UPDATE games
       SET steam_app_id = ?, title = ?, creator = ?, cover_url = ?, genre = ?,
           platform = ?, release_year = ?, steam_last_modified = ?, steam_synced_at = NOW()
       WHERE game_id = ?`,
      [
        steamAppId,
        title,
        creator,
        coverUrl,
        genre,
        platform,
        releaseYear,
        appListItem.last_modified || null,
        existing[0].game_id,
      ]
    );
    return { gameId: existing[0].game_id, imported: false };
  }

  const [result] = await pool.execute(
    `INSERT INTO games
      (steam_app_id, title, creator, cover_url, genre, platform, release_year, steam_last_modified, steam_synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      steamAppId,
      title,
      creator,
      coverUrl,
      genre,
      platform,
      releaseYear,
      appListItem.last_modified || null,
    ]
  );
  return { gameId: result.insertId, imported: true };
}

async function syncReviews(appid, gameId, reviewLimit) {
  if (reviewLimit === 0) return 0;

  const url = new URL(`${STORE_REVIEWS_BASE}/${appid}`);
  url.searchParams.set('json', '1');
  url.searchParams.set('filter', 'recent');
  url.searchParams.set('language', 'english');
  url.searchParams.set('purchase_type', 'all');
  url.searchParams.set('num_per_page', String(Math.min(reviewLimit, 100)));

  const data = await fetchJson(url);
  const summary = data.query_summary || {};
  await pool.execute(
    `UPDATE games
     SET steam_review_score = ?, steam_review_score_desc = ?,
         steam_total_positive = ?, steam_total_negative = ?, steam_total_reviews = ?
     WHERE game_id = ?`,
    [
      summary.review_score || null,
      summary.review_score_desc || null,
      summary.total_positive || 0,
      summary.total_negative || 0,
      summary.total_reviews || 0,
      gameId,
    ]
  );

  let imported = 0;
  for (const steamReview of data.reviews || []) {
    await pool.execute(
      `INSERT INTO steam_reviews
        (game_id, recommendation_id, author_steamid, review, language, voted_up,
         votes_up, votes_funny, weighted_vote_score, steam_created_at, steam_updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         review = VALUES(review),
         language = VALUES(language),
         voted_up = VALUES(voted_up),
         votes_up = VALUES(votes_up),
         votes_funny = VALUES(votes_funny),
         weighted_vote_score = VALUES(weighted_vote_score),
         steam_updated_at = VALUES(steam_updated_at),
         synced_at = NOW()`,
      [
        gameId,
        steamReview.recommendationid,
        steamReview.author?.steamid || null,
        steamReview.review || '',
        steamReview.language || null,
        steamReview.voted_up ?? null,
        steamReview.votes_up || 0,
        steamReview.votes_funny || 0,
        weightedScore(steamReview.weighted_vote_score),
        toDateFromUnix(steamReview.timestamp_created),
        toDateFromUnix(steamReview.timestamp_updated),
      ]
    );
    imported += 1;
  }
  return imported;
}

async function main() {
  const appIds = listOption('appids', process.env.STEAM_SYNC_APPIDS || '');
  const all = hasFlag('all');
  const limit = all ? 0 : numberOption('limit', Number(process.env.STEAM_SYNC_LIMIT || DEFAULT_LIMIT));
  const reviewLimit = numberOption(
    'reviews',
    Number(process.env.STEAM_SYNC_REVIEW_LIMIT || DEFAULT_REVIEW_LIMIT)
  );
  const delayMs = numberOption('delay-ms', Number(process.env.STEAM_SYNC_DELAY_MS || DEFAULT_DELAY_MS));
  const apiKey = process.env.STEAM_WEB_API_KEY || '';
  const stats = {
    gamesSeen: 0,
    gamesImported: 0,
    gamesUpdated: 0,
    reviewsImported: 0,
  };

  await ensureSteamSchema();
  const syncRunId = await createSyncRun();

  try {
    const apps = await getCandidateApps({ appIds, apiKey, limit });
    for (const appListItem of apps) {
      stats.gamesSeen += 1;
      try {
        const details = await getAppDetails(appListItem.appid);
        if (!details) {
          await sleep(delayMs);
          continue;
        }

        const game = await upsertGame(details, appListItem);
        if (!game) {
          await sleep(delayMs);
          continue;
        }

        if (game.imported) {
          stats.gamesImported += 1;
        } else {
          stats.gamesUpdated += 1;
        }

        stats.reviewsImported += await syncReviews(details.steam_appid, game.gameId, reviewLimit);
        console.log(`Synced ${details.name} (${details.steam_appid})`);
      } catch (err) {
        console.warn(`Skipping app ${appListItem.appid}: ${err.message}`);
      }
      await sleep(delayMs);
    }

    await finishSyncRun(syncRunId, 'success', stats);
    console.log(
      `Steam sync complete: ${stats.gamesImported} imported, ${stats.gamesUpdated} updated, ${stats.reviewsImported} reviews synced`
    );
  } catch (err) {
    await finishSyncRun(syncRunId, 'failed', stats, err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(`Steam sync failed: ${err.message}`);
  process.exit(1);
});
