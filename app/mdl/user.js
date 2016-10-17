const DataStore = require(appPath + '/dao/dao.js')

let dsUser = new DataStore('user')
let dsCur = new DataStore('current')

function login(data) {
    return new Promise((resolve, reject) => {
        dsUser.findOne({
            email: data.email
        }).then(user => {
            if (!user && data.pwdAg) { // 新用户先注册
                return register(data)
            }
            return user
        }).then(user => {
            if (user && checkPasswd(data.pwd, user.pwd)) { // 用户密码检查通过，记下当前登录用户
                return setCurUser(user)
            }// else 登录失败
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

function checkPasswd(pwd1, pwd2) {
    return pwd1 == pwd2
}

function register(data) {
    return new Promise((resolve, reject) => {
        dsUser.insert(data).then(user => {
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
            _id: 'onlyone',
            uid: user._id,
            isNewUser: user.isNew
        }
        dsCur.save(run).then(a => {
            resolve(user)
        }).catch(err => {
            reject(err)
        })
    })
}

function getCurUser() {
    return new Promise((resolve, reject) => {
        dsCur.findOne({}).then(run => {
            if (run) {
                return dsUser.findOne({
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
    return
}

module.exports = {
    login,
    getCurUser
}
