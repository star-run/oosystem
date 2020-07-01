// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, shell} = require('electron')
const fs = require('fs')
const exec = require('child_process').exec
let wins = {}

let accountlist

const path = require('path')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    width: 430,
    height: 330,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // mainWindow.setIgnoreMouseEvents(true)
  // and load the index.html of the app.
  mainWindow.loadFile('login.html')
  fs.readFile('./accounts.oo','utf-8',(err,data)=>{
    if(data.trim().length == 0){
      accountlist = []
      return
    }
    accountlist = JSON.parse(data.trim())
    setTimeout(()=>{
      mainWindow.webContents.send('accounts-pre',JSON.stringify(accountlist))
      console.log('accounts-pre event is already be trigger')
    },3000)
  })
  
  wins.mainWindow = mainWindow
  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//程序退出
ipcMain.on('user_exit', () => {
  app.quit()
})

ipcMain.on('user_min', () => {
  wins.mainWindow.minimize()
})

ipcMain.on('to-sign-up', () => {
  shell.openExternal('http://www.yjxyjx.club:9081/page/signup')
})

let requesHandle

ipcMain.on('want-to-login', (event, data) => {
  data = JSON.parse(data)
  
  let auto_login = data.auto_login
  let remember_password = data.remember_password 
  delete data.auto_login
  delete data.remember_password

  var http = require('http');
  var qs = require('querystring');

  var content = qs.stringify(data);

  var options = {
    host: 'www.yjxyjx.club',
    port: 9081,
    path: '/submit/loginin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',//post请求需要设置的type值
      'Content-Length': content.length
    }
  };
  var req = http.request(options, function (res) {
    var _data = '';
    res.on('data', function (chunk) {
      _data += chunk;
    });
    res.on('end', function () {
      let result = JSON.parse(_data)
      if(result.success){
        if(!result.passwordTrue){
          event.reply('password-error')
          return
        }

        let shouldtofile = {
          account:data.account,
          password:data.password,
          auto_login:auto_login,
          //以后具体添加更多
        }
        if(remember_password){
          Tools.updatearr(accountlist,shouldtofile,'account')
          fs.writeFile('./accounts.oo',JSON.stringify(accountlist),(err,data)=>{})
        }
        else{
          Tools.deleteitem(accountlist,shouldtofile.account,'account')
          fs.writeFile('./accounts.oo',JSON.stringify(accountlist),(err,data)=>{})
        }
      }
      event.reply('login-success',result)
    });
  });
  requesHandle = req
  req.write(content);
  req.end();
});

ipcMain.on('cancel-login',(event,data)=>{
  requesHandle.abort()
})

ipcMain.on('show-soft-keyboard',(event,data)=>{
  exec('osk.exe')
});

ipcMain.on('login-hidden',(event,data)=>{
  wins.mainWindow.minimize()
})

class Tools{
  static isexist(arr,value,propname=null){
    let exist = false
    if(propname){
      arr.forEach(item=>{
        if(item[propname] == value){
          exist = true
        }
      })
    }
    else{
      arr.forEach(item=>{
        if(item == value){
          exist = true
        }
      })
    }
    return exist
  }

  static updatearr(arr,item,propname=null){
    let exist = false
    if(propname){
      arr.forEach((value,index)=>{
        if(value[propname] == item[propname]){
          arr[index] = item
          exist = true
        }
      })
    }
    else{
      arr.forEach((value,index)=>{
        if(value==item){
          arr[index] = item
          exist = true
        }
      })
    }

    if(!exist){
      arr.push(item)
    }
  }

  static deleteitem(arr,item,propname=null){
    if(propname){
      let length = arr.length
      for(let index = 0;index < length;++index){
        if(arr[index][propname] == item){
          arr.splice(index,1)
          break;
        }
      }
    }
    else{
      let length = arr.length
      for(let index = 0;index < length;++index){
        if(arr[index] == item){
          arr.splice(index,1)
          break;
        }
      }
    }
  }
}