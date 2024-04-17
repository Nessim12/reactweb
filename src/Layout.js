// Layout.js
import React from 'react';
import Header from './Adminpage/Header';

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default Layout;
