import React from 'react';
import { Layout, Menu, Typography, Button, Space, Divider } from 'antd';
import {
  CloseOutlined, 
  DashboardOutlined,
  CalendarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
const { Sider } = Layout;
const { Title } = Typography;

function Sidebar({ isOpen, toggle }) {
  const menuItems = [
    { key: '1', label: 'Dashboard', icon: <DashboardOutlined /> },
    { key: '2', label: 'Sessions', icon: <CalendarOutlined /> },
    { key: '3', label: 'Settings', icon: <SettingOutlined /> },
  ];

  return (
    <Sider
      width={256}
      collapsedWidth={0}
      trigger={null}
      collapsible
      collapsed={!isOpen}
      className="custom-sider"
      style={{
        background: '#1f1f1f',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
      }}
    >
      
      <Menu
        theme="dark"
        mode="inline"
        items={menuItems}
        
        style={{
          background: '#1f1f1f',
          borderRight: 0,
          padding: '8px 0',
        }}
        onSelect={({ key }) => console.log('Selected:', key)}
      />
    </Sider>
  );
}




export default Sidebar;