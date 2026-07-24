const { app, BroswerWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        autoHideMenuBar: true,
        title: "Inventory & POS",
    });

    win.loadURL("https://filament-tracker-4w4e.vercel.app")
}

app.whenReady().then(createWindow);