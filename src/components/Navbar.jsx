import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="navbar">
      <Link to="/" className="logo">GAMEBOXD</Link>
      <nav>
        <Link to="/" className={isActive('/')}>Home</Link>
        <Link to="/games" className={isActive('/games')}>Games</Link>
        <Link to="/reports" className={isActive('/reports')}>Reports</Link>
        {user ? (
          <>
            <Link to="/lists" className={isActive('/lists')}>My Lists</Link>
            <span className="user-info">
              Logged in as <span>{user.username}</span>
            </span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')}>Login</Link>
            <Link to="/register" className={isActive('/register')}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
