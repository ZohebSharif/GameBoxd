import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getTopRated,
  getMostReviewed,
  getMostFavorited,
  getRatingsAverage,
  getUserReviews,
  getTopListCreators,
  getReportList,
} from '../api';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('top-rated');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // For user-reviews report
  const [userId, setUserId] = useState('');
  // For list report
  const [listId, setListId] = useState('');

  const reports = [
    { key: 'top-rated', label: 'Top 5 Highest-Rated Games' },
    { key: 'most-reviewed', label: 'Games with Most Reviews' },
    { key: 'most-favorited', label: 'Games with Most Favorites' },
    { key: 'ratings-average', label: 'Average Rating per Game' },
    { key: 'user-reviews', label: 'Reviews by a User' },
    { key: 'top-list-creators', label: 'Users with Most Lists' },
    { key: 'list-contents', label: 'Games in a List' },
  ];

  const fetchReport = async (reportKey) => {
    setLoading(true);
    setError('');
    setData([]);
    try {
      let result;
      switch (reportKey) {
        case 'top-rated': result = await getTopRated(); break;
        case 'most-reviewed': result = await getMostReviewed(); break;
        case 'most-favorited': result = await getMostFavorited(); break;
        case 'ratings-average': result = await getRatingsAverage(); break;
        case 'user-reviews':
          if (!userId.trim()) { setError('Please enter a User ID.'); setLoading(false); return; }
          result = await getUserReviews(userId);
          break;
        case 'top-list-creators': result = await getTopListCreators(); break;
        case 'list-contents':
          if (!listId.trim()) { setError('Please enter a List ID.'); setLoading(false); return; }
          result = await getReportList(listId);
          break;
        default: result = [];
      }
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeReport !== 'user-reviews' && activeReport !== 'list-contents') {
      fetchReport(activeReport);
    }
  }, [activeReport]);

  const renderTable = () => {
    if (data.length === 0) return <p style={{ color: '#9ab' }}>No data found for this report.</p>;

    switch (activeReport) {
      case 'top-rated':
      case 'ratings-average':
        return (
          <table className="report-table">
            <thead><tr><th>#</th><th>Game</th><th>Avg Rating</th><th>Total Ratings</th></tr></thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.game_id}>
                  <td>{i + 1}</td>
                  <td><Link to={`/games/${row.game_id}`}>{row.title}</Link></td>
                  <td>★ {Number(row.avg_rating).toFixed(1)}</td>
                  <td>{row.num_ratings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'most-reviewed':
        return (
          <table className="report-table">
            <thead><tr><th>#</th><th>Game</th><th>Review Count</th></tr></thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.game_id}>
                  <td>{i + 1}</td>
                  <td><Link to={`/games/${row.game_id}`}>{row.title}</Link></td>
                  <td>{row.review_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'most-favorited':
        return (
          <table className="report-table">
            <thead><tr><th>#</th><th>Game</th><th>Favorites</th></tr></thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.game_id}>
                  <td>{i + 1}</td>
                  <td><Link to={`/games/${row.game_id}`}>{row.title}</Link></td>
                  <td>{row.fav_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'user-reviews':
        return (
          <table className="report-table">
            <thead><tr><th>Game</th><th>Review</th><th>Date</th><th>By</th></tr></thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.review_id}>
                  <td><Link to={`/games/${row.game_id}`}>{row.title}</Link></td>
                  <td>{row.review.length > 100 ? row.review.substring(0, 100) + '...' : row.review}</td>
                  <td>{new Date(row.review_date).toLocaleDateString()}</td>
                  <td>{row.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'top-list-creators':
        return (
          <table className="report-table">
            <thead><tr><th>#</th><th>User</th><th>Lists Created</th></tr></thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.user_id}>
                  <td>{i + 1}</td>
                  <td>{row.username}</td>
                  <td>{row.list_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'list-contents':
        return (
          <div>
            {data.length > 0 && (
              <p style={{ color: '#9ab', marginBottom: '1rem' }}>
                List: <strong style={{ color: '#fff' }}>{data[0].name}</strong> by{' '}
                <span style={{ color: '#00e054' }}>{data[0].username}</span>
              </p>
            )}
            <table className="report-table">
              <thead><tr><th>#</th><th>Game</th><th>Added</th></tr></thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.game_id}>
                    <td>{i + 1}</td>
                    <td><Link to={`/games/${row.game_id}`}>{row.title}</Link></td>
                    <td>{new Date(row.added_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p style={{ color: '#9ab', marginBottom: '1.5rem' }}>
        SQL-generated reports — no SQL knowledge required!
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {reports.map((r) => (
          <button
            key={r.key}
            className={`btn ${activeReport === r.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveReport(r.key); setData([]); setError(''); }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {(activeReport === 'user-reviews') && (
        <div className="report-controls">
          <input
            placeholder="Enter User ID (e.g. 1)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={() => fetchReport('user-reviews')}>
            Load Reviews
          </button>
        </div>
      )}

      {(activeReport === 'list-contents') && (
        <div className="report-controls">
          <input
            placeholder="Enter List ID (e.g. 1)"
            value={listId}
            onChange={(e) => setListId(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={() => fetchReport('list-contents')}>
            Load List
          </button>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}
      {loading ? <div className="loading">Loading report...</div> : renderTable()}
    </div>
  );
}
