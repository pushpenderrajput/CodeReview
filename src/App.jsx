import React, { useState } from 'react';
import Layout from 'antd/es/layout/layout';
import { Content } from 'antd/es/layout/layout';
import Sidebar from './Components/SideBar';
import Header from './Components/Header';
import DiffView from './Components/DiffView';
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
      <Layout style={{ minHeight: '100vh' }}>
      <Header toggleSidebar={toggleSidebar} />
      <Layout hasSider>
        <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
        <Layout>
          <Content>
            <DiffView />
            
          </Content>
        </Layout>
      </Layout>
    </Layout>

  );
}

export default App;