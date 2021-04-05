import { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import { AppMode } from "./constants";

const { Sider } = Layout;

const AppSider = ({ mode, setMode }) => {
  const [selectedKeys, setSelectedKeys] = useState([mode]);

  const onMenuItemSelected = (item) => {
    setMode(item.key);
  };

  useEffect(() => {
    setSelectedKeys([mode]);
  }, [mode]);

  return (
    <Sider className="app-sider">
      <div className="app-logo">
        <span>Multi Management</span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        onSelect={onMenuItemSelected}
        selectedKeys={selectedKeys}
      >
        <Menu.Item key={AppMode.MODE_PHOTO}>Photo</Menu.Item>
        <Menu.Item key={AppMode.MODE_VIDEO}>Video</Menu.Item>
        <Menu.Item key={AppMode.MODE_DOCUMENT}>Document</Menu.Item>
        <Menu.Item key={AppMode.MODE_CALENDAR}>Calendar</Menu.Item>
        <Menu.Item key={AppMode.MODE_DEVICE}>Device</Menu.Item>
        <Menu.Item key={AppMode.MODE_LOCATION}>Location</Menu.Item>
        <Menu.Item key={AppMode.MODE_MAP}>Map</Menu.Item>
        <Menu.Item key={AppMode.MODE_SEARCH}>Search</Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AppSider;
