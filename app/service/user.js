const daoUser = require(appPath + '/dao/user.js')
const daoUserImg = require(appPath + '/dao/user-img.js')
const daoCurr = require(appPath + '/dao/current.js')
const md5 = require('md5')

const {RE_EMAIL: reEmail, RE_MOBILE: reMobile} = require(appPath+'/apps/consts.js')
let srvUser = {}

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
            if (user && checkPasswd(pwd, user)) { // 用户密码检查通过，记下当前登录用户
                return setCurUser(user)
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

    function checkPasswd(pwd, user) {
        return md5(pwd) == user.pwd
    }

    function register(data) {
        if (reEmail.test(data.account)){
            data.email = data.account
        }else if (reMobile.test(data.account)){
            data.mobile = data.account
        }
        data.pwd = md5(data.pwd)
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

    function setCurUser(user) {
        let curr = {
            uid: user._id,
            active: true,
            isNewUser: user.isNew
        }
        return new Promise((resolve, reject) => {
            srvUser.autoLogin(curr).then(a => {
                resolve(user)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

srvUser.autoLogin = function(curr){
    return daoCurr.save(curr)
}

srvUser.logout = function() {
    return daoCurr.save({
        active: false
    })
}

srvUser.loadCurrUser = function() {
    return new Promise((resolve, reject) => {
        daoCurr.findOne({}).then(curr => {
            if (curr) {
                return daoUser.findOne({
                    _id: curr.uid
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

srvUser.loadCurrent = function() {
    return daoCurr.findOne({})
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
