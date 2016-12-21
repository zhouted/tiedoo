
const remoteUrls = require(appPath+'/config/remote-urls.js')
const {request} = require(appPath+'/service/remote/remote-fn.js')
const consts = require(appPath+'/apps/consts.js')
const md5 = require('md5')
const tty = 'pad'

const remoteUser = {}

const urlLogin = remoteUser.urlLogin = remoteUrls.login
remoteUser.login = function(data){
    let identity = data.account
    let password = md5(data.pwd)
    let generateCode = '1234'
    password = md5(password+generateCode)
    return new Promise((resolve, reject) => {
        let param = {identity, password, generateCode, app:tty}
        request(urlLogin, param).then(rst => {
            let user = {
                id: rst.id,
                name: rst.name,
                nameEn: rst.enName,
                pwd: rst.password,
                email: rst.email,
                mobile: rst.mobile,
                tel: rst.personalPhone,
                userNo: rst.userNo,
                imageId: rst.avatarId,
                token: rst.token,
            }
            if (user.pwd){//前后端的密码md5大小写不一致
                user.pwd = user.pwd.toLowerCase()
            }
            let comp = {
                id: rst.company.companyId,
                name: rst.company.name,
                nameEn: rst.company.enName,
                addr: rst.company.address,
                addrEn: rst.company.enAddress,
                tel: rst.company.companyId,
                fax: rst.company.fax,
                web: rst.company.website,
                tradeType: rst.company.tradeType,
                imageId: rst.company.logo,
            }
            user.comp = comp//公司信息直接存储到用户里
            resolve(user)
        }).catch(err => {
            // console.log(err)
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

const urlRegister = remoteUser.urlRegister = remoteUrls.register
remoteUser.register = function(data){
    let identity = data.account
    let pwd = md5(data.pwd)
    let companyName = data.companyName
    let regType = 'email'
    let mobile = ''
    let smsCode = ''
    let tradeType = 1
    let ignoreImgCode = 1
    return new Promise((resolve, reject) => {
        let param = {identity, pwd, companyName, regType, mobile, smsCode, tradeType, ignoreImgCode}
        request(urlRegister, param).then(rst => {
            console.log(rst)
            resolve(rst)
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = remoteUser
