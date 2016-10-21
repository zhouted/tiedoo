const daoUser = require(appPath + '/dao/user.js')
const daoCurr = require(appPath + '/dao/current.js')
const md5 = require('md5')

// let daoUser = new DataStore('user')
// let daoCurr = new DataStore('current')

let mUser = {_dao: daoUser}

mUser.login = function(data) {
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
}
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
    return new Promise((resolve, reject) => {
        let run = {
            uid: user._id,
            active: true,
            isNewUser: user.isNew
        }
        daoCurr.save(run).then(a => {
            resolve(user)
        }).catch(err => {
            reject(err)
        })
    })
}

mUser.logout = function() {
    return daoCurr.update({}, {
        $set: {
            active: false
        }
    })
}

mUser.getCurUser = function() {
    return new Promise((resolve, reject) => {
        daoCurr.findOne({}).then(run => {
            if (run) {
                return daoUser.findOne({
                    _id: run.uid
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

mUser.save = function(user) {
    return daoUser.save(user)
}

module.exports = mUser
