let { ipcRenderer } = require('electron')

let winhandle = {
    movebar:document.getElementById('movebar')
}



let canmove = false
winhandle.movebar.addEventListener('mousedown',()=>{
    canmove = true
})

winhandle.movebar.addEventListener('mousemove',(event)=>{
    if(canmove){
        ipcRenderer.send('oobody-move',{
            x:event.movementX,
            y:event.movementY
        })
    }
})

winhandle.movebar.addEventListener('mouseout',()=>{
    canmove = false
})

winhandle.movebar.addEventListener('mouseup',()=>{
    canmove = false
})



ipcRenderer.send('oobody-show')




ipcRenderer.on('oobody-resize',(event,data)=>{
    document.getElementById('oobody-container').style.height = data[1] + 'px'
})