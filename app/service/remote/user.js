
const remoteUrls = require(appPath+'/config/remote-urls.js')
const {request} = require(appPath+'/service/remote/remote-fn.js')
const consts = require(appPath+'/apps/consts.js')
const md5 = require('md5')
const tty = 'pad'

const remoteUser = {}

const urlLogin = remoteUrls.login
remoteUser.login = function(data){
    let identity = data.account
    let password = md5(data.pwd)
    let generateCode = '1234'
    password = md5(password+generateCode)
    return new Promise((resolve, reject) => {
        let param = {identity, password, generateCode, app:tty}
        request(urlLogin, param).then(rst => {
            let user = toLocalUser(rst)
            resolve(user)
        }).catch(err => {
            if (err.code == 110){//用户未注册
                reject(consts.ERR_USER)
            }else if (err.code == 111){//密码错误
                reject(consts.ERR_PWD)
            }else{
                reject(err)
            }
        })
    })
}

const urlRegister = remoteUrls.register
remoteUser.register = function(data){
    let identity = data.account
    let pwd = md5(data.pwd)
    let companyName = data.companyName
    let regType = 'email', mobile = ''
    if (consts.RE_MOBILE.test(data.account)){
        regType = 'mobile', mobile = data.account
    }
    let smsCode = data.smsCode
    let tradeType = 1 //外贸
    let ignoreImgCode = 1 //忽略图片验证码
    return new Promise((resolve, reject) => {
        remoteUser.checkCompName(companyName).then(rst => {
            let param = {identity, pwd, companyName, regType, mobile, smsCode, tradeType, ignoreImgCode}//, SESSIONID: remoteUser.sessionId
            request(urlRegister, param).then(rst => {
                let user = toLocalUser(rst)
                resolve(user)
            }).catch(err => {
                if (err.code == 101){//验证码错误
                    reject(consts.ERR_SMSCODE)
                }else{
                    reject(err)
                }
            })
        }).catch(err => {
            reject(err)
        })
    })
}

const urlSendSmsCode = remoteUrls.sendSmsCode
remoteUser.sendSmsCode = function(mobile){
    return request(urlSendSmsCode, {mobile}).then(rst => {
        remoteUser.sessionId = rst
    })
}

const urlCheckCompName = remoteUrls.checkCompName
remoteUser.checkCompName = function(companyName){
    return new Promise((resolve, reject) => {
        request(urlCheckCompName, {companyName}).then(rst => {
            if (rst){
                return reject(consts.ERR_COMPNAME)
            }
            resolve(0)
        }).catch(err => {
            reject(err)
        })
    })
}


function toLocalUser(data){
    let user = {
        id: data.id,
        name: data.name,
        nameEn: data.enName,
        pwd: data.password,
        email: data.email,
        mobile: data.mobile,
        tel: data.personalPhone,
        userNo: data.userNo,
        imageId: data.avatarId,
        token: data.token,
    }
    if (user.pwd){//前后端的密码md5大小写不一致
        user.pwd = user.pwd.toLowerCase()
    }
    let comp = {
        id: data.company.companyId,
        name: data.company.name,
        nameEn: data.company.enName,
        addr: data.company.address,
        addrEn: data.company.enAddress,
        tel: data.company.companyId,
        fax: data.company.fax,
        web: data.company.website,
        tradeType: data.company.tradeType,
        imageId: data.company.logo,
    }
    user.comp = comp//公司信息直接存储到用户里
    return user
}

module.exports = remoteUser
