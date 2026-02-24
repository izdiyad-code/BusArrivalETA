// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000, height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadFile(path.join(__dirname, 'renderer/index.html'));
}

// IPC: Open Favourites Window
ipcMain.on('open-fav-window', () => {
    const favWin = new BrowserWindow({
        width: 800, height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    favWin.loadFile(path.join(__dirname, 'renderer/itinerary.html'));
});

// Setup data folder on start
app.whenReady().then(() => {
    const dir = path.join(__dirname, 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    createWindow();
});