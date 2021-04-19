const { Menu, app, BrowserWindow } = require("electron");

let win;

function createWindow(){
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadURL(`file://${__dirname}/src/index.html`);
}

app.on('ready', () => {
    createWindow();
    const template = [
        {
            label: 'File',
            submenu:[
                {
                    label: 'New Project'
                },
                {
                    label: 'Open Project'
                },
                {
                    label: 'Open Recent'
                },
                {
                    type:"separator"
                },
                {
                    label: 'Save'
                },
                {
                    label: 'Save As...'
                },
                {
                    type:"separator"
                },
                {
                    label: 'Preferences'
                },
                {
                    type:"separator"
                },
                {
                    label: 'Exit',
                    click: (() => app.quit())
                }
            ]
        },
        {
            label: 'Dev',
            submenu:[
                {
                    label: 'Reload',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) focusedWindow.reload();
                    }
                },
                {
                    label: 'Open DevTools',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) focusedWindow.webContents.openDevTools()
                    }
                }
            ]
        },
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});