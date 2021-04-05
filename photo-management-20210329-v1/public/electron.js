const path = require("path");
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  protocol,
  shell,
} = require("electron");

const isDev = require("electron-is-dev");
const fileDb = require("./fileDb");
const categoryDb = require("./categoryDb");

// if development environment -> enable hot reload
if (isDev) {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "node_modules", ".bin", "electron"),
    hardResetMethod: "exit",
  });
}

let mainWindow = null;

// create browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1066,
    height: 800,
    minWidth: 1066,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // discard menu in prod
  if (!isDev) {
    mainWindow.setMenu(null);
  }

  // load the index.html of the app
  // point to local dev server in development
  // otherwiser point to bundled production version
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // called after mainwindow is closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// call createWindow after electron ready
app.whenReady().then(() => {
  createWindow();

  // register file protocol for opening local file
  protocol.registerFileProtocol("file", (request, callback) => {
    const pathname = decodeURI(request.url.replace("file:///", ""));
    callback(pathname);
  });
});

// quit app after all windows closed, except MacOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// re-create windows when app actives but there are no windows now
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// handle message from Renderer process
ipcMain.handle("reload", async () => {
  mainWindow.reload();
});

// handle open file dialog called from renderer process
ipcMain.handle("open-file-dialog", async (_, contentType) => {
  console.log("handle open-file-dialog with content type:", contentType);

  // define file filters for opening file dialog
  const fileFilters = {
    photo: ["Images", ["jpg", "png", "gif", "tiff", "svg", "webp"]],
    video: ["Movies", ["mp4", "mkv", "avi", "mov", "ogg", "wmv", "webm"]],
    document: ["Documents", ["pdf", "docx", "xlsx", "pptx", "rtf"]],
  };

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: fileFilters[contentType][0],
        extensions: fileFilters[contentType][1],
      },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  return result;
});

// handle open external file by default
ipcMain.handle("open-external-file", async (_, filePath) => {
  console.log("handle open-external-file with filePath:", filePath);
  shell.openPath(filePath);
  return true;
});

// handle insert or update a file info
ipcMain.handle("db-import-file", async (_, fileInfo) => {
  console.log("handle db-import-file with fileInfo:", fileInfo);
  const fileInfoObj = JSON.parse(fileInfo);

  // upsert to location category
  if (fileInfoObj.country || fileInfoObj.region) {
    categoryDb.upsert({
      type: "location",
      country: fileInfoObj.country,
      region: fileInfoObj.region,
      previewPath: fileInfoObj.path,
      previewType: fileInfoObj.type,
      lat: fileInfoObj.lat,
      lon: fileInfoObj.lon,
    });
  }

  // upsert to calendar category
  const d = new Date(fileInfoObj.timestamp);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  if (year != 1970 && month != 1) {
    categoryDb.upsert({
      type: "calendar",
      year,
      month,
      previewPath: fileInfoObj.path,
      previewType: fileInfoObj.type,
    });
  }

  // upsert to device category
  if (fileInfoObj.device) {
    categoryDb.upsert({
      type: "device",
      device: fileInfoObj.device,
      previewPath: fileInfoObj.path,
      previewType: fileInfoObj.type,
    });
  }

  return fileDb.upsert({ ...fileInfoObj, year, month });
});

// handle find files with content type
ipcMain.handle("db-find-files-by-type", async (_, findInfo) => {
  return fileDb.findByType(JSON.parse(findInfo));
});

// handle find files by category
ipcMain.handle("db-find-files-by-category", async (_, findInfo) => {
  return fileDb.findByCategory(JSON.parse(findInfo));
});

// handle find files by search value
ipcMain.handle("db-find-files-by-search", async (_, findInfo) => {
  return fileDb.findBySearch(JSON.parse(findInfo));
});

// handle get file detail by path
ipcMain.handle("db-get-file-by-path", async (_, path) => {
  try {
    const ret = await fileDb.getByPath(path);
    console.log("result of get-file-by-path:", ret);
    return ret && ret.length > 0 ? ret[0] : { path };
  } catch (error) {
    return { path };
  }
});

// handle find categories with category type
ipcMain.handle("db-find-categories-by-type", async (_, findInfo) => {
  return categoryDb.findByCategory(JSON.parse(findInfo));
});
