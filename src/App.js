import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthComponent from './Auth/AuthComponent';
import Dashboard from './Adminpage/Dashboard';
import CreateUser from './Adminpage/CreateUser';
import Conge from './Adminpage/Conge';
import Layout from './Layout';


const isAuthenticated = () => {
  // Check if the user is authenticated (e.g., by verifying the authentication token)
  const authToken = localStorage.getItem('authToken');
  return !!authToken; // Return true if the authToken exists, false otherwise
};

const PrivateRoute = ({ element, ...rest }) => {
  return isAuthenticated() ? element : <Navigate to="/" />;
};

const App = () => {
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<AuthComponent />} />
        <Route
          path="/Dashboard/*"
          element={<PrivateRoute element={<Layout><Dashboard /></Layout>} />}
        />

        <Route
          path="/users/*"
          element={<PrivateRoute element={<Layout><CreateUser /></Layout>} />}
        />
        <Route
          path="/Conge/*"
          element={<PrivateRoute element={<Layout><Conge /></Layout>} />}
        />

        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
