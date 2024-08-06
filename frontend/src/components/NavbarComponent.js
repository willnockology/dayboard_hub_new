import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import '../global.css';
import './NavbarComponent.css';
import commercialLogo from '../assets/dayboardmaritime_logo.png';
import nonCommercialLogo from '../assets/dbys_logo.png';

const NavbarComponent = ({ setToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    history.push('/login');
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const logoSrc = user && user.commercial ? commercialLogo : nonCommercialLogo;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/dashboard">
            <img src={logoSrc} alt="Logo" className="navbar-logo-image" />
          </Link>
        </div>
        <button className="navbar-toggle" onClick={toggleMenu}>
          <span className="navbar-toggle-icon"></span>
          <span className="navbar-toggle-icon"></span>
          <span className="navbar-toggle-icon"></span>
        </button>
        <div className={`navbar-menu ${isOpen ? 'is-active' : ''}`}>
          <ul>
            <li>
              <Link 
                to="/dashboard" 
                className={`navbar-button ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className={`navbar-button ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                Profile
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={`navbar-button ${location.pathname === '/contact' ? 'active' : ''}`}
              >
                Contact
              </Link>
            </li>
            <li>
              <Link 
                to="/crew" 
                className={`navbar-button ${location.pathname === '/crew' ? 'active' : ''}`}
              >
                Crew
              </Link>
            </li>
            {user && user.role === 'Superuser' && (
              <li className="navbar-dropdown">
                <button onClick={toggleDropdown} className="navbar-button navbar-dropdown-toggle">
                  Admin <span className={`dropdown-indicator ${dropdownOpen ? 'open' : ''}`}>&#9662;</span>
                </button>
                {dropdownOpen && (
                  <ul className="navbar-dropdown-menu">
                    <li>
                      <Link to="/vessel-registration" className="navbar-button">Add Vessel</Link>
                    </li>
                    <li>
                      <Link to="/user-management" className="navbar-button">Users</Link>
                    </li>
                    <li>
                      <Link to="/register" className="navbar-button">Register User</Link>
                    </li>
                    <li>
                      <Link to="/form-editor" className="navbar-button">Forms</Link>
                    </li>
                    <li>
                      <Link to="/update-vessel" className="navbar-button">Update Vessel</Link>
                    </li>
                  </ul>
                )}
              </li>
            )}
            <li>
              <button onClick={handleLogout} className="navbar-button logout-button">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;
