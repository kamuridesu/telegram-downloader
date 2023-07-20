const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const serve = require('electron-serve');
const fs = require('fs');

const loadURL = serve({ directory: __dirname + '/www' }); // Replace 'www' with your Angular build output directory

// Create the main BrowserWindow
function createWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      preload: __dirname + "/preload.js",
      nodeIntegration: true,
      contextIsolation: false,
 }

  });

  ipcMain.on('selectFolder', (event) => {
    const options = {
      properties: ['openDirectory']
    };
  
    dialog.showOpenDialog(win, options).then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0];
        event.sender.send('folderSelected', folderPath);
      }
    });
  });

  ipcMain.on('newFile', (event, data) => {
    console.log("New file received!");
    const filePath = `${data.directory}/${data.fileName}`
    let response = false;
    try {
      fs.writeFileSync(filePath, data.buffer);
      response = true;
    } catch (e) {
      console.log(e);
    }
    event.sender.send("fileSaved", response);
  });
  
  // Load the Angular app
  loadURL(win);
}

app.whenReady().then(createWindow);

// Additional code for macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
