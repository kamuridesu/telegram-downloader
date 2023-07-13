const { app, BrowserWindow } = require('electron');
const serve = require('electron-serve');

const loadURL = serve({ directory: __dirname + '/www' }); // Replace 'www' with your Angular build output directory

// Create the main BrowserWindow
function createWindow() {
  const win = new BrowserWindow({
    // Window options
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
