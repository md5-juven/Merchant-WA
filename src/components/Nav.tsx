import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Nav.css';

export default function Nav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="nav-brand" end>
          Merchant Info
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" className="nav-link" end>
            Home
          </NavLink>
          <NavLink to="/form" className="nav-link">
            Form
          </NavLink>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span className="theme-icon" aria-hidden>
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
