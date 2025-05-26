import React from 'react';
import { Layout, Button, Typography, Space } from 'antd';
import { MenuOutlined, ShareAltOutlined, SettingOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

function Header({ toggleSidebar }) {
  return (
    <AntHeader 
      style={{
        background: '#141414',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: '64px',
        lineHeight: '64px'
      }}
    >
      <Space align="center" size="middle">
        {/* Always visible sidebar toggle button */}
        <Button
          type="text"
          icon={<MenuOutlined style={{ color: 'white', fontSize: '16px' }} />}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          style={{ marginRight: 8 }}
        />
        
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          CodeView
        </Title>
      </Space>
      
      <Space size="middle">
        <Button 
          type="primary" 
          icon={<ShareAltOutlined />}
        >
          Share
        </Button>
        <Button 
          icon={<SettingOutlined />}
          style={{ background: '#434343', borderColor: '#434343', color: 'white' }}
        >
          Settings
        </Button>
      </Space>
    </AntHeader>
  );
}

export default Header;