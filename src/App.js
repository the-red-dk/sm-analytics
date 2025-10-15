import React, { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import UserManagement from './components/UserManagement/UserManagement';
import PostManagement from './components/PostManagement/PostManagement';
import FollowerActivity from './components/FollowerActivity/FollowerActivity';

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'posts':
        return <PostManagement />;
      case 'followers':
        return <FollowerActivity />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="app-body">
        <Sidebar
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;