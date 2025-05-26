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
      <Layout>
      <Header toggleSidebar={toggleSidebar} />
      <Layout>
        <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
        <Content><DiffView/></Content>
      </Layout>
    </Layout>
  );
}

export default App;