const fs = require('fs');
const { app, BrowserWindow, dialog } = require('electron');

let mainWindow;

app.on('ready', () => {
    console.log('the application is ready');
    mainWindow = new BrowserWindow({ show: false });
    
    mainWindow.loadFile(`${__dirname}/index.html`);

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })
});


exports.getFilesFromUser = () => {
    const files = dialog.showOpenDialog({
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
    readFile(file);
}

const readFile = (file) => {
    const content = fs.readFileSync(file).toString();
    mainWindow.webContents.send('file-opened', file, content);
}