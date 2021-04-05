import { useState, useCallback, useEffect } from "react";
import { AppMode, ContentType } from "./constants";
import { getContentType } from "./utils";
import { ImportFileGrid } from "./CustomGrid";
import FormUpdateInfo from "./FormUpdateInfo";
import EmptyData from "./EmptyData";
import "./ImportPanel.css";

import { PageHeader, Layout, Radio, Divider, Button, Row, Col } from "antd";
import { FolderOpenOutlined } from "@ant-design/icons";

const ImportPanel = ({ mode, onBack }) => {
  const [contentType, setContentType] = useState(getContentType(mode));
  const [files, setFiles] = useState({});
  const [selectedFile, setSelectedFile] = useState({});

  //handle on mode changed
  useEffect(() => {
    let type = getContentType(mode);
    if (type === "unknown") {
      type = AppMode.MODE_PHOTO;
    }
    setContentType(type);
  }, [mode]);

  //handle selected content type changed
  const onContentTypeChanged = (e) => {
    setContentType(e.target.value);
  };

  //handle import clicked -> send event to electron to open file dialog
  const onImportClicked = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        "open-file-dialog",
        contentType
      );

      console.log("result of open file dialog success:", result);
      if (!result.canceled) {
        setFiles({ ...files, [contentType]: result.filePaths });
      }
    } catch (error) {
      console.log("result of open file dialog error:", error);
    }
  };

  //handle on a file is selected to update info
  const onFileSelected = useCallback(async (path) => {
    console.log("onFileSelected", path);
    try {
      const result = await window.electron.ipcRenderer.invoke(
        "db-get-file-by-path",
        path
      );
      console.log("result of get file by path success:", result);
      setSelectedFile(result);
    } catch (error) {
      console.log("result of get file by path error:", error);
      setSelectedFile({ path });
    }
  }, []);

  //handle on a file is imported successfully
  const onFileImportedSuccess = useCallback(
    async (file) => {
      console.log("onFileImportedSuccess", file, files);
      const currentPaths = files[contentType];
      const newPaths = currentPaths.filter((path) => path !== file.path);
      setFiles({ ...files, [contentType]: newPaths });
    },
    [files, contentType]
  );

  return (
    <Layout className="import-panel-container">
      <div className="panel-container-top">
        <PageHeader
          className="container-top-header"
          onBack={onBack}
          title="Import"
          subTitle=""
        />

        <Divider plain>Select a content type to import</Divider>
        <Layout className="container-top-content">
          <Radio.Group
            value={contentType}
            buttonStyle="solid"
            onChange={onContentTypeChanged}
          >
            <Radio.Button value={ContentType.TYPE_PHOTO}>Photo</Radio.Button>
            <Radio.Button value={ContentType.TYPE_VIDEO}>Video</Radio.Button>
            <Radio.Button value={ContentType.TYPE_DOCUMENT}>
              Document
            </Radio.Button>
          </Radio.Group>
          <Button
            type="primary"
            shape="round"
            icon={<FolderOpenOutlined />}
            onClick={onImportClicked}
          >
            Open
          </Button>
        </Layout>

        <Divider plain>Preview</Divider>
      </div>

      <Layout className="panel-container-bottom">
        {files[contentType] && files[contentType].length > 0 ? (
          <Row>
            <Col className="gutter-row" span={8}>
              <FormUpdateInfo
                file={selectedFile}
                contentType={contentType}
                onSuccess={onFileImportedSuccess}
              />
            </Col>
            <Col className="gutter-row" span={16}>
              <ImportFileGrid
                files={files[contentType]}
                contentType={contentType}
                onFileSelected={onFileSelected}
              />
            </Col>
          </Row>
        ) : (
          <EmptyData />
        )}
      </Layout>
    </Layout>
  );
};

export default ImportPanel;
