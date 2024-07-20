import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import '../global.css';
import './NavbarComponent.css';
import commercialLogo from '../assets/dayboardmaritime_logo.png';
import nonCommercialLogo from '../assets/dbys_logo.png';

const NavbarComponent = ({ setToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            {user && ['Superuser', 'Company User', 'Captain'].includes(user.role) && (
              <li>
                <Link to="/update-vessel">Update Vessel</Link>
              </li>
            )}
            {user && user.role === 'Superuser' && (
              <>
                <li>
                  <Link to="/vessel-registration">Register Vessel</Link>
                </li>
                <li>
                  <Link to="/user-management">User Management</Link>
                </li>
                <li>
                  <Link to="/register">Register User</Link>
                </li>
              </>
            )}
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;
