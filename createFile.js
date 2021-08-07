var commandName = document.getElementById("commandName");
var filePath = document.getElementById("filePath");
var additionalParameters = document.getElementById("additionalParameters");
var componentList = document.getElementById("additionalContent");

var Store = require('electron-store');
var remote = require('electron').remote;
var fs = remote.require('fs');
var win = remote.getCurrentWindow();
var dialog = remote.dialog;
var store = new Store();

var onChooseFile = new Event('onChooseFile', {bubbles: true});
var onChooseFolder = new Event('onChooseFolder', {bubbles: true});
var onChangeCommand = new Event('onChangeCommand', {bubbles: true});

win.setMinimumSize(500, 500);
win.setSize(500, 500);

var data = store.get('Commands');

var filePicker = document.getElementById("filePicker");

filePath.addEventListener("change", filePathChanged());

//Button choose file
function chooseFile(){
    filePath.value = dialog.showOpenDialogSync({properties:['openFile']});
    filePath.dispatchEvent(onChooseFile);
}

//Button choose folder
function chooseFolder(){
    filePath.value = dialog.showOpenDialogSync({properties:['openDirectory']});
    filePath.dispatchEvent(onChooseFolder);
}

//Custom user Input
function filePathChanged(){
    try{
        var path = fs.lstatSync(filePath.value);
        if(path.isDirectory()){
            filePath.dispatchEvent(onChooseFolder);
        }
        else if(path.isFile()){
            filePath.dispatchEvent(onChooseFile);
        }
    }catch(e){
        console.log("File does not exist");
    }
    filePath.dispatchEvent(onChangeCommand)
}

function saveEntry(){
    //Forgot Name
    if(commandName.value.length === 0){
        commandName.style.border = "solid 2px red";
        return
    }

    //Forgot filePath
    if(filePath.value.length === 0){
        filePath.style.border = "solid 2px red";
        return
    }

    //Store command
    data = store.get('Commands');
    data.push({
        "Name": commandName.value, 
        "Command": filePath.value,
        "Parameter": additionalParameters.value,
        "Used": 0
    });
    store.set("Commands", data);
    goToIndex();
}

//Return to main page
function goToIndex(){
    window.location.href = "index.html";
}