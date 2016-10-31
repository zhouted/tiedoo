const daoUser = require(appPath + '/dao/user.js')
const daoUserImg = require(appPath + '/dao/user-img.js')
const daoToken = require(appPath + '/dao/token.js')
const md5 = require('md5')

const {RE_EMAIL: reEmail, RE_MOBILE: reMobile} = require(appPath+'/apps/consts.js')
let srvUser = {
    _token: {}, //存放用户登录信息
}

srvUser.loadToken = function() {
    return daoToken.findOne({})
}

srvUser.loadLastUser = function() { //读取最后登录用户
    return new Promise((resolve, reject) => {
        daoToken.findOne({}).then(token => {
            if (token) {
                return daoUser.findOne({
                    _id: token.uid
                })
            }
            resolve(null)
        }).then(user => {
            resolve(user)
        }).catch(err => {
            reject(err)
        })
    })
}

srvUser.login = function(data) {
    let pwd = data.pwd
    return new Promise((resolve, reject) => {
        daoUser.findOne({
            account: data.account
        }).then(user => {
            if (!user && data.pwdAg) { // 新用户先注册
                return register(data)
            }
            return user
        }).then(user => {
            if (user && validPasswd(pwd, user)) { // 用户密码检查通过，记下当前登录用户
                return setUserToken(user)
            } // else 登录失败
            resolve({
                passed: false,
                user
            })
        }).then(user => { // 进入这一步表示登录成功
            resolve({
                passed: true,
                user
            })
        }).catch(err => {
            reject(err)
        })
    })

    // inner funs:
    function register(data) {
        if (reEmail.test(data.account)){
            data.email = data.account
        }else if (reMobile.test(data.account)){
            data.mobile = data.account
        }
        data.pwd = encrypt(data.pwd)
        delete data.pwdAg
        return new Promise((resolve, reject) => {
            daoUser.insert(data).then(user => {
                if (user) {
                    user.isNew = true
                    resolve(user)
                }
            }).catch(err => {
                reject(err)
            })
        })
    }

    function setUserToken(user) {
        let token = {
            uid: user._id,
            active: true,
            isNewUser: user.isNew
        }
        return new Promise((resolve, reject) => {
            srvUser.autoLogin(token).then(a => {
                resolve(user)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

srvUser.checkPasswd = function(pwd){
    return srvUser.load().then(user => {
        return validPasswd(pwd, user)
    })
}
function validPasswd(pwd, user) {
    return md5(pwd) == user.pwd
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
    Object.assign(srvUser._token, token)
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

srvUser.save = function(user) {
    return daoUser.save(user)
}

srvUser.saveImg = function(file){
    return daoUserImg.fsave(file)
}

srvUser.loadImg = function(id, size){
    return daoUserImg.findById(id, size)
}

module.exports = srvUser
