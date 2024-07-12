// frontend/src/components/NavbarComponent.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../global.css';
import './NavbarComponent.css';

const NavbarComponent = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">Dayboard Hub</div>
        <button className="navbar-toggle" onClick={toggleMenu}>
          <span className="navbar-toggle-icon"></span>
        </button>
        <div className={`navbar-menu ${isOpen ? 'is-active' : ''}`}>
          <ul>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <button onClick={onLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;

