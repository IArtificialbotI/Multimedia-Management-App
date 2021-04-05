import { useState, useEffect } from "react";
import { Image, Tag } from "antd";
import {
  CameraOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
} from "@ant-design/icons";
import { Grid, AutoSizer } from "react-virtualized";
import { CategoryType, ContentType } from "./constants";
import { Player } from "video-react";
import { getFileExtension, getFileName, toLocalPath } from "./utils";
import "video-react/dist/video-react.css";
import "./CustomGrid.css";

// Define the number of columns by width
const numOfColumns = (width) => {
  if (width < 1200) return 3;
  if (width < 1600) return 4;
  return 5;
};

// Custom document's icon by its extension
const DocumentItem = ({ extension, ...other }) => {
  const ext = extension.toLowerCase();

  if (ext === "pdf") {
    return (
      <FilePdfOutlined
        style={{
          fontSize: "96px",
          color: "#e98900",
        }}
        {...other}
      />
    );
  }
  if (ext === "doc" || ext === "docx" || ext === "rtf") {
    return (
      <FileWordOutlined
        style={{
          fontSize: "96px",
          color: "#188bec",
        }}
        {...other}
      />
    );
  }
  if (ext === "xls" || ext === "xlsx") {
    return (
      <FileExcelOutlined
        style={{
          fontSize: "96px",
          color: "#31b27d",
        }}
        {...other}
      />
    );
  }
  if (ext === "ppt" || ext === "pptx") {
    return (
      <FilePptOutlined
        style={{
          fontSize: "96px",
          color: "#f76b68",
        }}
        {...other}
      />
    );
  }
  return (
    <FileOutlined
      style={{
        fontSize: "96px",
        color: "#888",
      }}
      {...other}
    />
  );
};

// Calender Info represents time when file's is taken on
const CalenderInfo = ({ text }) => {
  return (
    <div className="row-prop" title={text}>
      <CalendarOutlined />
      <div className="desc">{text}</div>
    </div>
  );
};

// Device Info represents device which file's is taken by
const DeviceInfo = ({ text }) => {
  const txt = !text || text === "Unknown" ? "Device unknown" : text;
  return (
    <div className="row-prop" title={txt}>
      <CameraOutlined />
      <div className="desc">{txt}</div>
    </div>
  );
};

// Device Info represents location where file's is taken in
const LocationInfo = ({ text }) => {
  const txt = !text || text === "Unknown / Unknown" ? "Location unknown" : text;
  return (
    <div className="row-prop" title={txt}>
      <EnvironmentOutlined />
      <div className="desc">{txt}</div>
    </div>
  );
};

// ImportFileGrid using in ImportPanel Component
// For importing multimedia files
const ImportFileGrid = ({ files, contentType, onFileSelected }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // set selected index to highlight corresponding item
  const handleOnClicked = (id) => () => {
    setSelectedIndex(id);
  };

  // reset selected index to 0 if the contentType is changed
  useEffect(() => {
    setSelectedIndex(0);
  }, [contentType]);

  // when selected index change -> bring the file to outer
  useEffect(() => {
    if (onFileSelected) {
      onFileSelected(files[selectedIndex]);
    }
  }, [selectedIndex, onFileSelected, files]);

  return (
    <div className="customgrid-container">
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = numOfColumns(width);
          const rowCount = Math.ceil(files.length / columnCount);
          const expectedWidth = width / columnCount - 8;
          const expectedHeight = (3 * expectedWidth) / 4;
          return (
            <Grid
              className="container-grid"
              height={height}
              width={width}
              rowHeight={expectedHeight + 45}
              columnWidth={expectedWidth}
              columnCount={columnCount}
              rowCount={rowCount}
              cellRenderer={({ columnIndex, key, rowIndex, style }) => {
                const id = rowIndex * columnCount + columnIndex;
                if (id >= files.length) return null;
                else
                  return (
                    <div key={key} style={style} onClick={handleOnClicked(id)}>
                      <div
                        className="grid-cell"
                        style={{
                          width: `${expectedWidth}px`,
                          height: `${expectedHeight}px`,
                        }}
                      >
                        <div
                          className={`cell-content-wrapper ${
                            selectedIndex === id ? "selected" : ""
                          }`}
                          style={{
                            width: `${expectedWidth - 10}px`,
                            height: `${expectedHeight - 10}px`,
                          }}
                        >
                          {contentType === ContentType.TYPE_PHOTO && (
                            <img
                              className="image"
                              width={expectedWidth - 14}
                              height={expectedHeight - 14}
                              src={toLocalPath(files[id])}
                              alt={getFileName(files[id])}
                            />
                          )}
                          {contentType === ContentType.TYPE_VIDEO && (
                            <video
                              className="video"
                              width={expectedWidth - 14}
                              height={expectedHeight - 14}
                              src={toLocalPath(files[id])}
                            />
                          )}
                          {contentType === ContentType.TYPE_DOCUMENT && (
                            <DocumentItem
                              extension={getFileExtension(files[id])}
                            />
                          )}
                        </div>
                        <div
                          className="cell-tag-wrapper"
                          style={{
                            width: `${expectedWidth - 10}px`,
                            height: "45px",
                          }}
                        >
                          <Tag className="name">{getFileName(files[id])}</Tag>
                          <Tag color="blue">{getFileExtension(files[id])}</Tag>
                        </div>
                      </div>
                    </div>
                  );
              }}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

// MainFileGrid using in AppContent Component
// For previewing multimedia files
const MainFileGrid = ({ files }) => {
  const handleOpenDocument = (path) => async () => {
    try {
      await window.electron.ipcRenderer.invoke("open-external-file", path);
      console.log("result of open external file success", path);
    } catch (error) {
      console.log("result of open external file error", path, error);
    }

    return;
  };

  return (
    <div className="customgrid-container">
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = numOfColumns(width);
          const rowCount = Math.ceil(files.length / columnCount);
          const expectedWidth = width / columnCount - 8;
          const expectedHeight = (3 * expectedWidth) / 4;
          return (
            <Grid
              className="container-grid"
              height={height}
              width={width}
              rowHeight={expectedHeight + 75}
              columnWidth={expectedWidth}
              columnCount={columnCount}
              rowCount={rowCount}
              cellRenderer={({ columnIndex, key, rowIndex, style }) => {
                const id = rowIndex * columnCount + columnIndex;
                if (id >= files.length) return null;
                else
                  return (
                    <div key={key} style={style}>
                      <div
                        className="grid-cell"
                        style={{
                          width: `${expectedWidth}px`,
                          height: `${expectedHeight}px`,
                        }}
                      >
                        <div
                          className="cell-content-wrapper"
                          style={{
                            width: `${expectedWidth - 10}px`,
                            height: `${expectedHeight - 10}px`,
                          }}
                        >
                          {files[id].type === ContentType.TYPE_PHOTO && (
                            <Image
                              className="image"
                              src={toLocalPath(files[id].path)}
                              width={expectedWidth - 14}
                              height={expectedHeight - 14}
                            />
                          )}
                          {files[id].type === ContentType.TYPE_VIDEO && (
                            <Player
                              fluid={false}
                              width={expectedWidth - 14}
                              height={expectedHeight - 14}
                            >
                              <source src={toLocalPath(files[id].path)} />
                            </Player>
                          )}
                          {files[id].type === ContentType.TYPE_DOCUMENT && (
                            <DocumentItem
                              extension={getFileExtension(files[id].path)}
                              onClick={handleOpenDocument(files[id].path)}
                            />
                          )}
                        </div>
                        <div
                          className="main-file-info-wrapper"
                          style={{
                            width: `${expectedWidth - 10}px`,
                            height: "75px",
                          }}
                        >
                          <CalenderInfo
                            text={`${files[id].year} / ${files[id].month}`}
                          />
                          <DeviceInfo text={files[id].device || "Unknown"} />
                          <LocationInfo
                            text={`${files[id].country || "Unknown"} / ${
                              files[id].region || "Unknown"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
              }}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

// CategoryGrid using in AppContent Component
// For previewing categories
const CategoryGrid = ({ categories, categoryType, onCategorySelected }) => {
  const handleOnClicked = (id) => () => {
    onCategorySelected(id);
  };

  return (
    <div className="customgrid-container">
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = numOfColumns(width);
          const rowCount = Math.ceil(categories.length / columnCount);
          const expectedWidth = width / columnCount - 8;
          const expectedHeight = (3 * expectedWidth) / 4;
          return (
            <Grid
              className="container-grid"
              height={height}
              width={width}
              rowHeight={expectedHeight + 45}
              columnWidth={expectedWidth}
              columnCount={columnCount}
              rowCount={rowCount}
              cellRenderer={({ columnIndex, key, rowIndex, style }) => {
                const id = rowIndex * columnCount + columnIndex;
                if (id >= categories.length) return null;
                else
                  return (
                    <div key={key} style={style} onClick={handleOnClicked(id)}>
                      <div
                        className="grid-cell"
                        style={{
                          width: `${expectedWidth}px`,
                          height: `${expectedHeight}px`,
                        }}
                      >
                        <div
                          className="cell-content-wrapper"
                          style={{
                            width: `${expectedWidth - 10}px`,
                            height: `${expectedHeight - 10}px`,
                          }}
                        >
                          {categories[id].previewType ===
                            ContentType.TYPE_PHOTO && (
                            <img
                              className="image"
                              width={expectedWidth - 14}
                              height={expectedHeight - 14}
                              src={toLocalPath(categories[id].previewPath)}
                              alt={getFileName(categories[id].previewPath)}
                            />
                          )}
                          {categories[id].previewType ===
                            ContentType.TYPE_VIDEO && (
                            <video
                              className="video"
                              width={expectedWidth - 14}
                              height={expectedHeight - 14}
                              src={toLocalPath(categories[id].previewPath)}
                            />
                          )}
                          {categories[id].previewType ===
                            ContentType.TYPE_DOCUMENT && (
                            <DocumentItem
                              extension={getFileExtension(
                                categories[id].previewPath
                              )}
                            />
                          )}
                        </div>

                        <div
                          className="cell-category-detail"
                          style={{
                            width: `${expectedWidth - 10}px`,
                            height: "45px",
                          }}
                        >
                          {categoryType === CategoryType.TYPE_CALENDAR && (
                            <CalenderInfo
                              text={`${categories[id].data.year} / ${categories[id].data.month}`}
                            />
                          )}
                          {categoryType === CategoryType.TYPE_DEVICE && (
                            <DeviceInfo
                              text={categories[id].data.device || "Unknown"}
                            />
                          )}
                          {categoryType === CategoryType.TYPE_LOCATION && (
                            <LocationInfo
                              text={`${
                                categories[id].data.country || "Unknown"
                              } / ${categories[id].data.region || "Unknown"}`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
              }}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

export { ImportFileGrid, MainFileGrid, CategoryGrid };
