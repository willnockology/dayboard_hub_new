import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import DashboardComponent from './components/DashboardComponent';
import LoginComponent from './components/LoginComponent';
import ProfileComponent from './components/ProfileComponent';
import DynamicFormComponent from './components/DynamicFormComponent';
import ViewFormComponent from './components/ViewFormComponent';
import NavbarComponent from './components/NavbarComponent';
import FooterComponent from './components/FooterComponent';
import ContactComponent from './components/ContactComponent';
import RegisterComponent from './components/RegisterComponent';
import VesselRegistrationComponent from './components/VesselRegistrationComponent'; // Add this import

import './global.css';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  return (
    <Router>
      <div id="root">
        <NavbarComponent setToken={setToken} />
        <div className="content container">
          <Switch>
            <Route path="/login">
              <LoginComponent setToken={setToken} />
            </Route>
            <Route path="/register">
              <RegisterComponent setToken={setToken} /> {/* Corrected route */}
            </Route>
            <Route path="/profile">
              <ProfileComponent />
            </Route>
            <Route path="/dashboard">
              <DashboardComponent setToken={setToken} />
            </Route>
            <Route path="/form/:formType/:id" component={DynamicFormComponent} />
            <Route path="/form/view/:formType/:id" component={ViewFormComponent} />
            <Route path="/contact" component={ContactComponent} />
            <Route path="/vessel-registration">
              <VesselRegistrationComponent token={token} /> {/* Add this route */}
            </Route>
            <Route exact path="/">
              <LoginComponent setToken={setToken} />
            </Route>
          </Switch>
        </div>
        <FooterComponent className="footer" />
      </div>
    </Router>
  );
};

export default App;
