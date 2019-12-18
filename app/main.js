const fs = require('fs');
const { app, BrowserWindow, dialog,Menu } = require('electron');

let mainWindow;

app.on('ready', () => {
    console.log('the application is ready');
    mainWindow = new BrowserWindow({ show: false });
    
    Menu.setApplicationMenu(applicationMenu);

    mainWindow.loadFile(`${__dirname}/index.html`);

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })
});


exports.getFilesFromUser = () => {
    const files = dialog.showOpenDialog(mainWindow,{
        properties: ["openFile"],
        buttonLabel:'Open n Render',
        title:'Open mare document',
        filters: [
            { name: 'Markdown Files', extensions: ['md', 'markdown', 'marcdown', 'mdown'] },
            { name: 'Text Files', extensions:['txt','text']}
        ]
    });

    if (!files) return;

    const file = files[0];
    app.addRecentDocument(file)
    readFile(file);
}

exports.saveMarkdownFile = (file,content) => {
    if (!file) {
        file = dialog.showSaveDialog(mainWindow,{
            title: 'save Markdown',
            defaultPath: app.getPath('desktop'),
            filters: [
                {
                    name: 'Markdown File', extensions: ['md', 'markdown', 'mdown', 'marcdown']
                }
            ]
        })
    }
    
    if (!file) return;

    fs.writeFileSync(file, content)

    readFile(file)
}

exports.saveHTMLFile = (content) => {
    
        file = dialog.showSaveDialog(mainWindow,{
            title: 'Save HTML',
            defaultPath: app.getPath('desktop'),
            filters: [
                {
                    name: 'HTML Files', extensions: ['html', 'htm']
                }
            ]
        })
    
    if (!file) return;

    fs.writeFileSync(file, content)

    // readFile(file)
}


const readFile = (file) => {
    const content = fs.readFileSync(file).toString();
    mainWindow.webContents.send('file-opened', file, content);
}

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New File',
                accelerator: 'CommandOrControl+N',
                click() {
                    mainWindow.webContents.send('new-file');
                },
            },
            {
                label: 'Open File',
                accelerator: 'CommandOrControl+O',
                click() {
                    exports.getFilesFromUser();
                },
            },
            {
                label: 'Save File',
                accelerator: 'CommandOrControl+S',
                click() {
                    mainWindow.webContents.send('save-markdown');
                },
            },
            {
                label: 'Save Html',
                accelerator: 'CommandOrControl+E',
                click() {
                    mainWindow.webContents.send('save-Html');
                },
            },
            {
                label: 'Copy',
                role:'copy',
            }
        ]
    }
]

//for macOs it bit different
if (process.platform === 'darwin') {
    const applicationName = 'Mare';

    template.unshift({
        label: applicationName,
        submenu: [
            {
                label: `About ${applicationName}`,
                role:'about',
            },
            {
                label: `Quit ${applicationName}`,
                role:'quit'
            }
        ]
    })
}
if (process.platform === 'win32') {
    const applicationName = 'Mare';

    template[0].submenu.push(
            
            {
                label: `Quit ${applicationName}`,
                role:'quit'
            }
    )
}


const applicationMenu = Menu.buildFromTemplate(template)