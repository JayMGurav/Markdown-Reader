const { remote, ipcRenderer,shell } = require('electron');
//main process
const {getFilesFromUser,saveMarkdownFile,saveHTMLFile} = remote.require('./main.js')

//current window
const currentWindow = remote.getCurrentWindow();

const marked = require('marked');
const path = require('path');


let filePath = null;

let originalContent = '';

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const updateInterface = (isEdited) => {
  let title = 'Mare';
  
  if (filePath != null) {
    title = `${title} - ${path.basename(filePath)}`
  }
  
  if (isEdited) {
    title = `${title} (edited)`
  }

  showFileButton.disabled = !filePath;
  openInDefaultButton.disabled = !filePath;

  saveMarkdownButton.disabled = !isEdited;
  revertButton.disabled = !isEdited;
  currentWindow.setTitle(title);
  currentWindow.setDocumentEdited(isEdited);
  if(filePath)currentWindow.setRepresentedFilename(filePath);
}

markdownView.addEventListener('keyup', event => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);
  updateInterface(currentContent!==originalContent)
});

openFileButton.addEventListener('click', () => {
  getFilesFromUser();
})

// Save Button
const saveMarkdown = () => {
  saveMarkdownFile(filePath,markdownView.value)
}

saveMarkdownButton.addEventListener('click',saveMarkdown )

ipcRenderer.on('save-markdown', saveMarkdown);

//SaveHTML Button
const saveHtml =  () => {
  saveHTMLFile(htmlView.innerHTML)
}
saveHtmlButton.addEventListener('click',saveHtml)

ipcRenderer.on('save-Html', saveHtml);

//New File Button
const newFileClicked = () => {
  if (originalContent !== markdownView.value) {
    return alert('File Not Saved');
  }

  filePath = null;
  originalContent = ''
  updateInterface(false);
  markdownView.value = originalContent;
  renderMarkdownToHtml(originalContent);
}
newFileButton.addEventListener('click',newFileClicked)
ipcRenderer.on('new-file', newFileClicked);


// Show file
showFileButton.addEventListener('click',()=>{
  if (!filePath) {
    return alert('Nope!!');
  }

  shell.showItemInFolder(filePath);

})

openInDefaultButton.addEventListener('click', () => {
  if (!filePath) {
    return alert('No file');
  }

  shell.openItem(filePath);
  
})


ipcRenderer.addListener('file-opened', (event, file, content) => {  
  filePath = file;
  originalContent = content;

  markdownView.value = content;
  renderMarkdownToHtml(content);

  updateInterface(false)
})