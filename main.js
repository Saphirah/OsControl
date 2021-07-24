const { app, globalShortcut, Menu, Tray, nativeImage, ipcMain} = require('electron')
const {BrowserWindow} = require("electron-acrylic-window");
const readdirp = require('readdirp');
const {getAppDataPath} = require("appdata-path");
var win;

//Only allow one Application
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}
app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (win) {
    if(!win.isVisible()) win.show();
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

//Database
const Store = require('electron-store');
const store = new Store();

if(!store.has("Commands")){
  var commands = [
    {
      "Name": "Create Command", 
      "Command": "OsSysCtrl.CreateCommand",
      "Parameter": "",
      "Used": 0
    },  
    {
      "Name": "Reload Programs", 
      "Command": "OsSysCtrl.ReloadPrograms",
      "Parameter": "",
      "Used": 0
    },
    {
      "Name": "Quit", 
      "Command": "OsSysCtrl.Quit",
      "Parameter": "",
      "Used": 0
    },
  ];
  store.set("Commands", commands);
  reimportPrograms()
}

function reimportPrograms(){
  
  var commands = store.get("Commands");
  //Import Programs
  readdirp('C:/ProgramData/Microsoft/Windows/Start Menu/', {fileFilter: '*.lnk'})
    .on('data', (entry) => {
      var name = "Start " + entry.basename.replace(".lnk", "");
      //If program is not yet in list
      if(commands.filter(word => word["Name"] == name).length == 0){
        commands.push({
          "Name": name,
          "Command": '"' + entry.fullPath + '"',
          "Parameter": "",
          "Used": 0
        });
      }
    })
    //Error Handling
    .on('warn', error => console.error('non-fatal error', error))
    .on('error', error => console.error('fatal error', error))
    //Save on finish
    .on('end', () => {
      readdirp(getAppDataPath() + '/Microsoft/Windows/Start Menu/', {fileFilter: '*.lnk'})
        .on('data', (entry) => {
          var name = "Start " + entry.basename.replace(".lnk", "");
          //If program is not yet in list
          if(commands.filter(word => word["Name"] == name).length == 0){
            commands.push({
              "Name": name,
              "Command": '"' + entry.fullPath + '"',
              "Parameter": "",
              "Used": 0
            });
          }
        })
        //Error Handling
        .on('warn', error => console.error('non-fatal error', error))
        .on('error', error => console.error('fatal error', error))
        //Save on finish
        .on('end', () => {
          store.set("Commands", commands);
      });
    });
}

let tray = null
app.whenReady().then(() => {
    //Create Tray
    tray = new Tray(__dirname + '/images/tray.png');
    console.log(__dirname + '/images/tray.png');
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Control 1.0', enabled: false},
      { label: 'Quit App', 
        click: function() {
          app.quitting = true;
          app.quit();
        }
      }
    ]);
    tray.setToolTip('Control 1.0');
    tray.setContextMenu(contextMenu);

    //Create Window
    win = new BrowserWindow({
        width: 500,
        height: 600,
        frame: false,
        transparent: true,
        show: false,
        resizable: true,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        Titel: "Control 1.0",
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true
        },
        vibrancy: {
          theme: 'dark',
          effect: 'blur',
          maximumRefreshRate: 30,
          disableOnBlur: true
        },
        icon: __dirname + '/images/icon.png'
    });

    win.on('close', (event) => {
      if (app.quitting) {
        win = null
      } else {
        event.preventDefault()
        win.hide()
      }
    });

    /*win.on('blur', (event) => {
      win.hide()
    });*/
    
    win.loadFile('index.html');

    //Window Toggle Shortcut
    const ret = globalShortcut.register('Alt+X', () => {
      if(win.isVisible()){
        win.hide();
      }
      else{
        win.show();
      }
    })

    win.once('ready-to-show', () => {
      //var electronVibrancy = require('..');
      //electronVibrancy.SetVibrancy(win, 0);
      win.show()
    })
  });

  ipcMain.on('Quit', (evt, arg) => {
    app.quitting = true;
    app.quit()
  })

  ipcMain.on('ReloadPrograms', (evt, arg) => {
    reimportPrograms();
  })