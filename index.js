const Store = require('electron-store');
var exec = require('child_process').exec;
const win = require('electron').remote.getCurrentWindow();
const {ipcRenderer} = require('electron');
win.setMinimumSize(500, 170);
win.setSize(500, 170);
const store = new Store();
var data = store.get('Commands');
var list;
const searchBar = document.getElementById('searchBar');
const outputFieldContainer = document.getElementById('outputFieldContainer');
selectedElement = 0;

function recreateList(){
  outputFieldContainer.innerHTML = "";
  if(searchBar.value.length > 0){
    var searchBarList = searchBar.value.split(" ").filter(word => word.length > 0);
    list = data;
    console.log(list);
    searchBarList.forEach((item, index)=>{
      list = list.filter(word => word["Name"].toLowerCase().indexOf(item.toLowerCase()) !== -1);
    });
    if(list.length > 0){
      list.sort((itemA, itemB) => itemB["Used"] - itemA["Used"]);
      list.forEach((item, index)=>{
          node = document.createElement("div");
          node.className = "outputFields";
          node.innerHTML = item["Name"];
          if(index == selectedElement){
            node.style.backgroundColor = "#2980b9";
            node.style.transform = "scale(1.05, 1.05)";
            node.style.color = "white";
            node.style.height = "35px";
            node.style.fontSize = "21";
          }
          outputFieldContainer.appendChild(node);
      });
      win.setMinimumSize(500, 600);
      win.setSize(500, 600);
    } else{
      win.setMinimumSize(500, 170);
      win.setSize(500, 170);
    }
  } else {
    win.setMinimumSize(500, 170);
    win.setSize(500, 170);
  }
}

document.addEventListener('keydown', function(e) {
  switch (e.keyCode) {
    //When Press Arrow Up
    case 38:
      selectedElement = Math.max(selectedElement - 1, 0);
      recreateList();
      break;

    //When Press Arrow Down
    case 40:
      selectedElement = Math.max(Math.min(selectedElement + 1, outputFieldContainer.childElementCount-1), 0);
      recreateList();
      break;

    //When Press Enter
    case 13:
      //Make sure the index is correct
      if(selectedElement < 0){
        selectedElement = 0;
      }
      if(selectedElement >= list.length){
        selectedElement = list.length - 1;
      }

      //Get selected Item
      var item = list[selectedElement]

      //Increment Use by 1
      data = store.get('Commands')
      data.forEach((currentItem, index)=>{
        if(currentItem["Name"] == item["Name"]){
          data[index]["Used"] += 1;
          console.log("Incremented by 1");
        }
      });
      store.set('Commands', data)

      //Execute custom code
      if(!programCommands(item["Command"])){
        window.close();
        exec(item["Command"], { encoding: 'utf-8' });
      }

      //Clear search list
      outputFieldContainer.innerHTML = "";
      searchBar.value = "";
      selectedElement = 0;
      win.setSize(500, 170);
      break;
  }
});

function programCommands(command){
  if(!command.startsWith("OsSysCtrl.")) 
    return false;
  
  command = command.replace("OsSysCtrl.", "");
  console.log(command);
  switch(command) {
    case "CreateCommand":
      window.location.href = "createFile.html";
      return true;
      break;
    default:
      ipcRenderer.send(command);
      return true;
      break;
  }
}
searchBar.addEventListener('keydown', function(e){
  if (e.which === 38 || e.which === 40) {
    e.preventDefault();
  }
});

const inputHandler = function(e) {
  recreateList();
}



searchBar.addEventListener('input', inputHandler);
searchBar.addEventListener('propertychange', inputHandler);
searchBar.addEventListener('search', inputHandler);