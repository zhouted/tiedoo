const remoteUrls = require(appPath+'/config/remote-urls.js')
const remoteFn = require(appPath+'/service/remote/remote-fn.js')
const consts = require(appPath+'/apps/consts.js')
const md5 = require('md5')
const tty = 'pad'

const remoteUser = {}

remoteUser.login = function(data){
    let pLogin // promise of login
    let identity = data.account
    if (data.token){
        pLogin = loginByToken(identity, data.token, data.ip)
    }else{
        pLogin = loginByPwd(identity, data.pwd, data.encoded)
    }
    return new Promise((resolve, reject) => {
        pLogin.then(rst => {
            let user = toLocalUser(rst)
            resolve(user)
        }).catch(err => {
            if (err.code == 110){//用户未注册
                reject(consts.ERR_USER_NO)
            }else if (err.code == 111){//密码错误
                reject(consts.ERR_PWD)
            }else{
                reject(err)
            }
        })
    })
    function loginByPwd(identity, password, encoded){
        let generateCode = (Math.random()*10000).toFixed()//四位随机码
        if (password && !encoded) {
            password = md5(password)
        }
        password = md5(password+generateCode)
        return remoteFn.request(remoteUrls.login, {identity, password, generateCode, app:tty})
    }
    function loginByToken(identity, token, ip){
        return remoteFn.request(remoteUrls.loginAuto, {identity, token, ip})
    }
}

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
        remoteUser.checkCompName(companyName).then(() => {
            let param = {identity, pwd, companyName, regType, mobile, smsCode, tradeType, ignoreImgCode}//, SESSIONID: remoteUser.sessionId
            remoteFn.request(remoteUrls.register, param).then(rst => {
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

remoteUser.sendSmsCode = function(mobile){
    return remoteFn.request(remoteUrls.sendSmsCode, {mobile}).then(rst => {
        remoteUser.sessionId = rst
    })
}

remoteUser.checkCompName = function(companyName){
    return new Promise((resolve, reject) => {
        remoteFn.request(remoteUrls.checkCompName, {companyName}).then(rst => {
            if (rst){
                return reject(consts.ERR_COMPNAME)
            }
            resolve(0)
        }).catch(err => {
            reject(err)
        })
    })
}

remoteUser.checkAccount = function(identity){
    return new Promise((resolve, reject) => {
        remoteFn.request(remoteUrls.checkAccount, {identity}).then(() => {
            resolve(0)
        }).catch(err => {
            if (err.code == 100){
                reject(consts.ERR_USER_EXISTS)
            }
            reject(err)
        })
    })
}

function getNamesByLang(names, lang){
    if (names && names.length){
        for (let item of names){
            if (item.lang === lang){
                return item.name
            }
        }
    }
}
function toLocalUser(data){
    let user = {
        id: data.id,
        name: data.name,
        nameEn: getNamesByLang(data.langs, '01'),
        pwd: data.password,
        email: data.email,
        mobile: data.mobile,
        tel: data.personalPhone,
        userNo: data.userNo,
        imageId: data.avatarId,
        token: data.token,
        tokenId: data.account,
        tokenIp: data.ip,
    }
    if (user.pwd){//前后端的密码md5大小写不一致
        user.pwd = user.pwd.toLowerCase()
    }
    if (data.company){
        let comp = {
            id: data.company.companyId,
            name: data.company.name,
            nameEn: data.company.enName,
            addr: data.company.address,
            addrEn: data.company.enAddress,
            tel: data.company.contact,
            fax: data.company.fax,
            web: data.company.website,
            tradeType: data.company.tradeType,
            imageId: data.company.logo,
        }
        user.comp = comp//公司信息直接存储到用户里
    }
    return user
}

module.exports = remoteUser
