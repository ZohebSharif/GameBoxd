import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopRated, getMostReviewed, getMostFavorited } from '../api';

export default function Home() {
  const [topRated, setTopRated] = useState([]);
  const [mostReviewed, setMostReviewed] = useState([]);
  const [mostFavorited, setMostFavorited] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getTopRated(), getMostReviewed(), getMostFavorited()])
      .then(([tr, mr, mf]) => {
        setTopRated(tr);
        setMostReviewed(mr);
        setMostFavorited(mf);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div>
      <h1 className="page-title">Welcome to Gameboxd</h1>
      <p style={{ color: '#9ab', marginBottom: '2rem' }}>
        Track games you've played. Save those you want to play. Tell your friends what's good.
      </p>

      <Section title="Top Rated Games" data={topRated} valueLabel="Avg Rating" valueKey="avg_rating" format={(v) => Number(v).toFixed(1)} />
      <Section title="Most Reviewed Games" data={mostReviewed} valueLabel="Reviews" valueKey="review_count" />
      <Section title="Most Favorited Games" data={mostFavorited} valueLabel="Favorites" valueKey="fav_count" />
    </div>
  );
}

function Section({ title, data, valueLabel, valueKey, format }) {
  if (!data.length) return null;
  return (
    <div className="home-section">
      <h2>{title}</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Game</th>
            <th>{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.game_id}>
              <td>{i + 1}</td>
              <td><Link to={`/games/${row.game_id}`}>{row.title}</Link></td>
              <td>{format ? format(row[valueKey]) : row[valueKey]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
