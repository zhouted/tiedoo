const daoUser = require(appPath + '/dao/user.js')
const daoUserImg = require(appPath + '/dao/user-img.js')
const daoToken = require(appPath + '/dao/token.js')
const consts = require(appPath+'/apps/consts.js')
const remoteUser = require(appPath + '/service/remote/user.js')
const remoteFile = require(appPath+'/service/remote/remote-file.js')
const md5 = require('md5')

let srvUser = {
    _token: {}, //存放用户登录信息
}

srvUser.loadToken = function() {
    return daoToken.findOne({})
}

srvUser.checkAccount = function(account){
    return new Promise((resolve, reject) => {
        daoUser.findOne({//先查询本地账号
            $or: [{email: account}, {mobile: account}]
        }).then(user => {
            if (user) {//账户已存在
                return reject(consts.ERR_USER_EXISTS)
            }
            //检查云端账户
            remoteUser.checkAccount(account).then(rst => {
                resolve(rst)
            }).catch(err => reject(err))
        })
    })
}

//user login && register
srvUser.login = function(data) {
    let account = data.account, pwd = data.pwd
    let token = {account, active: true}
    return new Promise((resolve, reject) => {
        function doLogin(user){
            if (!validPasswd(pwd, user)){
                return reject(consts.ERR_PWD)
            }
            // 用户密码检查通过，记下当前登录用户
            token.uid = user._id
            token.ip = user.tokenIp
            token.token = user.token
            return srvUser.autoLogin(token).then(a => {
                resolve(user)
            }).catch(err => {
                reject(err)
            })
        }
        daoUser.findOne({//先查询本地账号
            $or: [{email: account}, {mobile: account}]
        }).then(user => {
            if (user){//本地已有账号
                return doLogin(user)
            }
            if (data.pwdAg) { // 有确认密码表示要注册
                return register(data).then(user => {
                    doLogin(user, true)
                })
            }
            //远程登录并获取用户
            return remoteLogin(data).then(user => {
                doLogin(user)
            })
        }).catch(err => {
            reject(err)
        })
    })

    // inner funs:
    function remoteLogin(data){//尝试云端登录
        return new Promise((resolve, reject) => {
            remoteUser.login(data).then((user) => {
                daoUser.insert(user).then(user => {
                    resolve(user)
                })
            }).catch(err => {
                reject(err)
            })
        })
    }
    function register(data) {//注册
        return new Promise((resolve, reject) => {
            remoteUser.register(data).then(user => {
                daoUser.insert(user).then(user => {
                    resolve(user)
                })
            }).catch(err => {
                reject(err)
            })
        })
    }
}

srvUser.checkPasswd = function(pwd){
    let user = daoUser.findOneSync({})//deasync not working https://github.com/abbr/deasync/issues/64
    // return srvUser.load().then(user => {
        return validPasswd(pwd, user)
    // })
}
srvUser.validPasswd = validPasswd
function validPasswd(pwd, user) {
    return md5(pwd) == user.pwd
}

srvUser.sendSmsCode = function(mobile){
    return remoteUser.sendSmsCode(mobile)
}

srvUser.changePasswd = function(old, pwd){
    return srvUser.load().then(user => {
        if (!validPasswd(old, user)){
            return Promise.reject(new Error('原密码错误！'))
        }
        let data = {
            _id: user._id,
            pwd: encrypt(pwd)
        }
        return daoUser.save(data)
    })
}
function encrypt(pwd){//加密
    return md5(pwd)
}

srvUser.autoLogin = function(token){
    tfn.merge(srvUser._token, token)
    return daoToken.save(token)
}

srvUser.logout = function() {
    return daoToken.save({
        active: false
    })
}

srvUser.load = function() {// 只读取当前登录用户
    return daoUser.findOne({_id: srvUser._token.uid})
}

srvUser.loadComp = function() {
    return srvUser.load().then(user => {
        return user&&user.comp
    })
}

srvUser.save = function(data) {
    let user = tfn.merge({}, data)
    if (user.comp){
        let comp = user.comp; delete user.comp
        for (let k in comp){
            user['comp.'+k] = comp[k]
        }
    }
    return daoUser.save(user)
}

srvUser.saveComp = function(comp){
    let user = {_id: srvUser._token.uid}
    for (let k in comp){
        user['comp.'+k] = comp[k]
    }
    return daoUser.save(user)
}

srvUser.saveImg = function(file){
    return daoUserImg.fsave(file)
}

srvUser.loadImg = function(id, size){
    if (remoteFile.typeOfId(id)){//是云端文件
        return remoteFile.loadImg(id)
    }
    return daoUserImg.findById(id, size)
}

// 下载用户信息from云端
srvUser.download = function(progress){
    let uid = srvUser._token.uid
    let account = srvUser._token.account
    let token = srvUser._token.token
    let ip = srvUser._token.ip
    return new Promise((resolve, reject) => {
        remoteUser.login({account, token, ip}).then(user => {
            saveUser(user)
        }).catch(err => {
            console.log(err)
            srvUser.load().then(user => {
                remoteUser.login({account, pwd:user.pwd, encoded:'md5'}).then(user => {
                    saveUser(user)
                })
            }).catch(err => {
                reject(err)
            })
        })
        function saveUser(user){
            user._id = uid
            daoUser.save(user).then(rst => {
                resolve(user)
            })
            if (typeof(progress) == 'function'){
                progress('requested')
            }
        }
    })
}

module.exports = srvUser
