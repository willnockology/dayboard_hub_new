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
import UserManagementComponent from './components/UserManagementComponent';
import CrewModuleComponent from './components/CrewModuleComponent';
import FormEditorComponent from './components/FormEditorComponent';
import VesselFormComponent from './components/VesselFormComponent';
import NCRComponent from './components/NCRComponent'; // Consolidated NCR Component

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
            <Route path="/profile">
              <ProfileComponent />
            </Route>
            <Route path="/dashboard">
              <DashboardComponent setToken={setToken} />
            </Route>
            <Route path="/form/:id" component={DynamicFormComponent} />
            <Route path="/form/view/:id" component={ViewFormComponent} />
            <Route path="/contact" component={ContactComponent} />
            <Route path="/vessel-form">
              <VesselFormComponent token={token} />
            </Route>
            <Route path="/user-management">
              <UserManagementComponent />
            </Route>
            <Route path="/crew">
              <CrewModuleComponent />
            </Route>
            <Route path="/form-editor">
              <FormEditorComponent token={token} />
            </Route>
            {/* NCR Routes */}
            <Route path="/ncrs/new">
              <NCRComponent token={token} />
            </Route>
            <Route path="/ncrs/edit/:id">
              <NCRComponent token={token} />
            </Route>
            <Route path="/ncrs">
              <NCRComponent token={token} />
            </Route>
            {/* Default Route */}
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
