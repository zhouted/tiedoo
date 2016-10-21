const daoUser = require(appPath + '/dao/user.js')
const daoCurr = require(appPath + '/dao/current.js')
const md5 = require('md5')

let srvLogin = {
    current: {} // 记录当前登录信息
}

srvLogin.login = function(data) {
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
        return new Promise((resolve, reject) => {
            data.pwd = md5(data.pwd)
            delete data.pwdAg
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
        // Object.assign(srvLogin.current, curr)
        return new Promise((resolve, reject) => {
            srvLogin.autoLogin(curr).then(a => {
                resolve(user)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

srvLogin.autoLogin = function(curr){
    Object.assign(srvLogin.current, curr)
    return daoCurr.save(curr)
}

srvLogin.logout = function() {
    return daoCurr.save({
        active: false
    })
}

srvLogin.loadLoginUser = function() {
    return daoUser.findOne({
        _id: srvLogin.current.uid
    })
}

module.exports = srvLogin
