// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
let { ipcRenderer } = require('electron')


let win = require('electron').remote.getCurrentWindow()
let body = document.getElementById('login-block')

let dragstart = false
let offsetx = 400;
let offsety = 300;

body.addEventListener('mouseleave', () => {
    win.setIgnoreMouseEvents(true, { forward: true })
    dragstart = false
})

body.addEventListener('mouseenter', () => {
    win.setIgnoreMouseEvents(false)
})

body.addEventListener('mousedown', (oEvent) => {
    oEvent = oEvent || window.event
    if (!(oEvent.srcElement.id === 'username_input' || oEvent.srcElement.id === 'password_input')) {
        dragstart = true
    }
})

body.addEventListener('mousemove', function (event) {
    if (dragstart) {
        offsetx += event.movementX
        offsety += event.movementY

        this.style.top = offsety + 'px'
        this.style.left = offsetx + 'px'
    }
})

body.addEventListener('mouseup', () => {
    dragstart = false
})


//集中管理login表单
let forms = {
    username_input: document.getElementById('username_input'),
    password_input: document.getElementById('password_input'),
    auto_login: document.getElementById('auto_login'),
    remember_password: document.getElementById('rememberpassword')
}

//集中管理按钮
let buttons = {
    set_button: document.getElementById('set_button'),
    min_button: document.getElementById('min_button'),
    close_button: document.getElementById('close_button'),
    account_list_show_button: document.getElementById('account_list_show_button'),
    keyboard_show: document.getElementById('keyboard_show'),
    findback_password: document.getElementById('findbackpassword'),
    login_in_button: document.getElementById('login_in_button'),
    show_binarycode: document.getElementById('show_binarycode'),
    registered_button: document.getElementById('registered_button'),
    cancel_login: document.getElementById('login-cancel')
}

let accountsPre //用来存储所有的保存账号


//提示信息块
let prompt = {
    cont: document.getElementById('promp_bar').style,
    text: document.getElementById('promp_msg')
}

//设置按钮
buttons.set_button.addEventListener('click', function () {
    //打开设置
})

//最小化按钮
buttons.min_button.addEventListener('click', function () {
    //最小化
    ipcRenderer.send('user_min')
})

//关闭按钮
buttons.close_button.addEventListener('click', function () {
    //关闭窗口
    ipcRenderer.send('user_exit')
})

//展开账号列表
buttons.account_list_show_button.addEventListener('click', function () {
    //展开账号列表

})

//展开软键盘
buttons.keyboard_show.addEventListener('click', function () {
    //展开软键盘
    ipcRenderer.send('show-soft-keyboard')
})

//账号找回按钮
buttons.findback_password.addEventListener('click', function () {
    //账号找回
})

//登录按钮
buttons.login_in_button.addEventListener('click', function () {
    //登录

    //检查输入值的有效性
    if ((forms.username_input.value == '') || (forms.password_input.value == '')) {
        prompt.cont.backgroundColor = 'rgb(50,50,50)'
        prompt.text.innerText = '账号或密码不可以为空'
        setTimeout(() => {
            prompt.cont.backgroundColor = 'transparent'
            prompt.text.innerText = ''
        }, 3000)
        return
    }
    let auto_login = forms.auto_login.checked
    let remember_password = forms.remember_password.checked

    //登陆动画
    document.getElementById('logining-show').style.animation = "loginstart 0.3s forwards"

    ipcRenderer.send('want-to-login', JSON.stringify({ account: forms.username_input.value, password: forms.password_input.value, auto_login, remember_password }))

})

//展示二维码
buttons.show_binarycode.addEventListener('click', function () {
    //展示二维码
})

//注册按钮
buttons.registered_button.addEventListener('click', function () {
    //注册
    ipcRenderer.send('to-sign-up')
})

buttons.cancel_login.addEventListener('click', function () {
    ipcRenderer.send('cancel-login')
    document.getElementById('logining-show').style.animation = "logincancel 0.3s forwards"
})

forms.auto_login.addEventListener('click', function () {
    forms.remember_password.checked = true
})

forms.remember_password.addEventListener('click', function () {
    if (!this.checked) {
        forms.auto_login.checked = false
    }
})

ipcRenderer.on('accounts-pre', (event, data) => {
    accountsPre = JSON.parse(data)
    console.log(accountsPre)
    forms.username_input.value = accountsPre[0].account
    forms.password_input.value = accountsPre[0].password
    console.log(accountsPre[0])
    forms.remember_password.checked = true
    if (accountsPre[0].auto_login) {
        forms.auto_login.checked = true
        buttons.login_in_button.click()
    }
})

ipcRenderer.on('login-success', (event, data) => {
    
    setTimeout(()=>{
        document.getElementById('login-block').style.animation = 'loginsuccess 1s forwards'
        setTimeout(()=>{
            document.getElementById('login-block').style.display = 'none'
            ipcRenderer.send('login-hidden')
        },1000)
    },1000)
    console.log(data)
})

ipcRenderer.on('password-error', (event, data) => {
    prompt.cont.backgroundColor = 'rgb(50,50,50)'
    prompt.text.innerText = '账号或密码错误!'
    document.getElementById('logining-show').style.animation = "logincancel 0.3s forwards"
    setTimeout(() => {
        prompt.cont.backgroundColor = 'transparent'
        prompt.text.innerText = ''
    }, 3000)
})