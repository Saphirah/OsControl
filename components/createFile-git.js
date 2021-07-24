var createFileGitShown = false;
var createFileGitContent = ""

var createFileGitContainer = document.createElement("div");
componentList.appendChild(createFileGitContainer);

const createFileGitRequest = new XMLHttpRequest();
createFileGitRequest.onload = function(){
    createFileGitContent = this.responseText;
}
createFileGitRequest.open("GET", "components/createFile-git.html", true);
createFileGitRequest.send();

document.addEventListener("onChooseFolder", function(){
    if(fs.existsSync(filePath.value + "/.git")){
        //Enlarge Window
        if(!createFileGitShown){
            createFileGitShown = true;
            var [width, height] = win.getSize();
            win.setMinimumSize(width, height+50);
            win.setSize(width, height+50);
            createFileGitContainer.innerHTML = createFileGitContent;
        }
    } else {
        //Decrease Window
        if(createFileGitShown){
            createFileGitShown = false;
            var [width, height] = win.getSize();
            win.setMinimumSize(width, height-50);
            win.setSize(width, height-50);
            createFileGitContainer.innerHTML = "";
        }
    }
});

function createFileGitPull(){
    filePath.value = "git -C \"" + filePath.value + "\" pull"
    saveEntry()
}

function createFileGitCommit(){
    filePath.value = "git -C \"" + filePath.value + "\" commit -am \"Automated Commit\""
    saveEntry()
}

function createFileGitPush(){
    filePath.value = "git -C \"" + filePath.value + "\" push"
    saveEntry()
}