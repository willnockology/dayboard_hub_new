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
import RegisterComponent from './components/RegisterComponent'; // Corrected import

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
      <NavbarComponent />
      <div className="content">
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
        </Switch>
      </div>
      <FooterComponent />
    </Router>
  );
};

export default App;
