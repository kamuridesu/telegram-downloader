const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const serve = require('electron-serve');

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

  ipcMain.on('receivedFile', (event, data) => {
    console.log("New file received!");
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
