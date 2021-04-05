import React, { useState } from "react";
import "./App.css";
import { Layout } from "antd";
import { AppMode } from "./constants";
import AppSider from "./AppSider";
import AppContent from "./AppContent";
import ImportPanel from "./ImportPanel";

const App = () => {
  //define app state
  const [mode, setMode] = useState(AppMode.MODE_PHOTO);
  const [importing, setImporting] = useState(false);

  //handle on import media
  const onImport = () => {
    setImporting(true);
  };

  //handle on back after opening import pannel
  const onImportPanelBack = () => {
    setImporting(false);
  };

  return (
    <React.Fragment>
      {importing ? (
        <ImportPanel mode={mode} onBack={onImportPanelBack} />
      ) : (
        <Layout className="app">
          <AppSider mode={mode} setMode={setMode} />
          <Layout className="app-site-layout">
            <AppContent mode={mode} onImport={onImport} setMode={setMode} />
          </Layout>
        </Layout>
      )}
    </React.Fragment>
  );
};

export default App;
