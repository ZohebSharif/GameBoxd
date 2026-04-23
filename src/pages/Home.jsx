import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopRated, getMostReviewed, getMostFavorited } from '../api';

const ASCII_CONTROLLER = String.raw`
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
                          @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.                             
                    @@@@@@............................................@@@@@@                        
              @@@@@@....................@@@@@@@@@@@@@@@@....................@@@@@@                  
            @@........................@@################@@........####............@@.               
          @@........####..............@@################@@..........................@@              
          @@........####..............@@################@@..........................@@              
          @@..........................@@################@@..........................@@              
          @@............................@@@@@@@@@@@@@@@@............................@@              
       .@@......................######....................######..............--......@@            
       .@@...................:##......##................##......##..........------....@@            
       .@@......####........##....##....##............##....##....##..........--......@@            
      @@...:....####........##..######:.##............##..###*##..##....**..........++..@@.         
      @@....####....####....##....##...:##.......:....#*....##...:##:.******......++++++@@          
      @@....####....####......##......##......####...:..##......##......**..........++..@@          
      @@........###*...::.......######:......:....:....:..*#####..............##........@@.         
    @@--........####........--..........----------------..........--........######......--@@        
    @@--........:::.......--@@----------@@@@@@@@@@@@@@@@----------@@--.......:##........--@@        
    @@--...............:--@@..@@@@@@@@@@................@@@@@@@@@@..@@--................--@@        
    @@--..............--@@   .         .                         .  ..@@--..............--@@        
    @@--............--@@                                             . .@@--............--@@        
    @@--..........--@@..                                                  @@--..........--@@        
   .@@:-..........:-@@                                                    @@--.:........-:%@        
      @@:-......--@@                                                       .@@--......-:@@          
        @@------@@.                                                           @@------@@            
          @@@@@@.                                                              .@@@@@@.             
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                    
`;

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
      <section className="home-hero">
        <h1 className="home-hero-title">GAMEBOXD</h1>
        <div className="ascii-controller-wrap" aria-hidden="true">
          <pre className="ascii-controller">{ASCII_CONTROLLER}</pre>
        </div>
        <p className="home-hero-slogan">
          Track games you&apos;ve played. Save those you want to play. Tell your friends what&apos;s
          good.
        </p>
      </section>

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
