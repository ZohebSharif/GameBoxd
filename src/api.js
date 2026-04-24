const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// Auth
export const register = (username, email, password) =>
  request('/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });

export const login = (username, password) =>
  request('/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const logout = () =>
  request('/logout', { method: 'POST' });

export const getMe = () =>
  request('/me');

// Games
export const getGames = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/games${query ? `?${query}` : ''}`);
};

export const addGame = (game) =>
  request('/games', { method: 'POST', body: JSON.stringify(game) });

export const getGame = (id) =>
  request(`/games/${id}`);

export const postReview = (gameId, review) =>
  request(`/games/${gameId}/reviews`, { method: 'POST', body: JSON.stringify({ review }) });

export const postRating = (gameId, rating) =>
  request(`/games/${gameId}/rating`, { method: 'POST', body: JSON.stringify({ rating }) });

export const postFavorite = (gameId) =>
  request(`/games/${gameId}/favorite`, { method: 'POST' });

// Lists
export const getLists = () =>
  request('/lists');

export const createList = (name) =>
  request('/lists', { method: 'POST', body: JSON.stringify({ name }) });

export const getList = (listId) =>
  request(`/lists/${listId}`);

export const addListItem = (listId, gameId) =>
  request(`/lists/${listId}/items`, { method: 'POST', body: JSON.stringify({ game_id: gameId }) });

// Reports
export const getTopRated = () => request('/reports/top-rated');
export const getMostReviewed = () => request('/reports/most-reviewed');
export const getMostFavorited = () => request('/reports/most-favorited');
export const getRatingsAverage = () => request('/reports/ratings-average');
export const getUserReviews = (userId) => request(`/reports/user-reviews/${userId}`);
export const getTopListCreators = () => request('/reports/top-list-creators');
export const getReportList = (listId) => request(`/reports/list/${listId}`);
