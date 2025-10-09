import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import UserNavbar from './UserNavbar';

const DashboardLayout = ({ children, role }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {role === 'student' ? <UserNavbar /> : <Header role={role} />}
        <main className="flex-1 flex flex-col overflow-hidden p-6">
          {/* The main content area is now a flex container that won't scroll */}
          <div className="flex-1 flex flex-col h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
