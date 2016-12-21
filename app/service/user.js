const daoUser = require(appPath + '/dao/user.js')
const daoUserImg = require(appPath + '/dao/user-img.js')
const daoToken = require(appPath + '/dao/token.js')
const consts = require(appPath+'/apps/consts.js')
const remoteUser = require(appPath + '/service/remote/user.js')
const md5 = require('md5')

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
    let account = data.account, pwd = data.pwd
    return new Promise((resolve, reject) => {
        daoUser.findOne({
            $or: [{email: account}, {mobile: account}]
        }).then(user => {
            if (user){
                return user//本地已有账号
            }
            if (data.pwdAg) { // 新用户先注册
                return register(data)
            }
            return remoteLogin(data)//远程登录并获取用户
        }).then(user => {
            if (validPasswd(pwd, user)) { // 用户密码检查通过，记下当前登录用户
                return setUserToken(user, account)
            }
            reject(consts.ERR_PWD)
        }).then(user => { // 进入这一步表示登录成功
            resolve(user)
        }).catch(err => {
            reject(err)
        })
    })

    // inner funs:
    function remoteLogin(data){//尝试云端登录
        return new Promise((resolve, reject) => {
            remoteUser.login(data).then((user) => {
                daoUser.insert(user).then(user => {
                    setUserToken(user, data.account, false).then(user => {
                        resolve(user)
                    })
                })
            }).catch(err => {
                reject(err)
            })
        })
    }
    function register(data) {//注册
        if (consts.RE_EMAIL.test(data.account)){
            data.email = data.account
        }else if (consts.RE_MOBILE.test(data.account)){
            data.mobile = data.account
        }
        data.pwd = encrypt(data.pwd)
        delete data.pwdAg
        return new Promise((resolve, reject) => {
            remoteUser.register(data).then(user => {
                daoUser.insert(user).then(user => {
                    setUserToken(user, data.account, true).then(user => {
                        resolve(user)
                    })
                })
            }).catch(err => {
                reject(err)
            })
        })
    }

    // function keepUser(user, isNew){
    //     return new Promise((resolve, reject) => {
    //         daoUser.insert(user).then(user => {
    //             setUserToken(user, isNew).then(user => {
    //                 resolve(user)
    //             }).catch(err => reject(err))
    //         })
    //     })
    // }

    function setUserToken(user, account, isNew = false) {
        let token = {
            account,
            uid: user._id,
            active: true,
            isNewUser: isNew,
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
    let user = daoUser.findOneSync({})//deasync not working https://github.com/abbr/deasync/issues/64
    // return srvUser.load().then(user => {
        return validPasswd(pwd, user)
    // })
}
srvUser.validPasswd = validPasswd
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

srvUser.save = function(user) {
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
    return daoUserImg.findById(id, size)
}

module.exports = srvUser
